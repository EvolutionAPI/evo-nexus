"""Scheduled Tasks API — one-off scheduled actions."""

import subprocess
import threading
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from flask_login import current_user
from models import db, ScheduledTask, has_permission, audit

bp = Blueprint("tasks", __name__)


def _require(resource: str, action: str):
    if not has_permission(current_user.role, resource, action):
        return jsonify({"error": "Forbidden"}), 403
    return None


@bp.route("/api/tasks")
def list_tasks():
    denied = _require("tasks", "view")
    if denied:
        return denied

    status_filter = request.args.get("status")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))

    query = ScheduledTask.query
    if status_filter:
        query = query.filter_by(status=status_filter)
    query = query.order_by(ScheduledTask.scheduled_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "tasks": [t.to_dict() for t in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
    })


@bp.route("/api/tasks/<int:task_id>")
def get_task(task_id):
    denied = _require("tasks", "view")
    if denied:
        return denied

    task = ScheduledTask.query.get_or_404(task_id)
    return jsonify(task.to_dict())


@bp.route("/api/tasks", methods=["POST"])
def create_task():
    denied = _require("tasks", "execute")
    if denied:
        return denied

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    required = ["name", "type", "payload", "scheduled_at"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data["type"] not in ("skill", "prompt", "script"):
        return jsonify({"error": "type must be skill, prompt, or script"}), 400

    try:
        scheduled_at = datetime.fromisoformat(data["scheduled_at"].replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return jsonify({"error": "Invalid scheduled_at format (use ISO 8601)"}), 400

    task = ScheduledTask(
        name=data["name"],
        description=data.get("description"),
        type=data["type"],
        payload=data["payload"],
        agent=data.get("agent"),
        scheduled_at=scheduled_at,
        status="pending",
        created_by=current_user.id if current_user.is_authenticated else None,
    )
    db.session.add(task)
    db.session.commit()

    audit(current_user, "create", "tasks", f"Created task #{task.id}: {task.name}")
    return jsonify(task.to_dict()), 201


@bp.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    denied = _require("tasks", "execute")
    if denied:
        return denied

    task = ScheduledTask.query.get_or_404(task_id)
    if task.status != "pending":
        return jsonify({"error": "Only pending tasks can be edited"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    for field in ("name", "description", "type", "payload", "agent"):
        if field in data:
            setattr(task, field, data[field])

    if "scheduled_at" in data:
        try:
            task.scheduled_at = datetime.fromisoformat(data["scheduled_at"].replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return jsonify({"error": "Invalid scheduled_at format"}), 400

    db.session.commit()
    audit(current_user, "update", "tasks", f"Updated task #{task.id}: {task.name}")
    return jsonify(task.to_dict())


@bp.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def cancel_task(task_id):
    denied = _require("tasks", "execute")
    if denied:
        return denied

    task = ScheduledTask.query.get_or_404(task_id)
    if task.status == "running":
        return jsonify({"error": "Cannot cancel a running task"}), 400

    if task.status == "pending":
        task.status = "cancelled"
        db.session.commit()
        audit(current_user, "cancel", "tasks", f"Cancelled task #{task.id}: {task.name}")
    else:
        db.session.delete(task)
        db.session.commit()
        audit(current_user, "delete", "tasks", f"Deleted task #{task.id}: {task.name}")

    return jsonify({"status": "ok"})


@bp.route("/api/tasks/<int:task_id>/run", methods=["POST"])
def run_task_now(task_id):
    """Execute a task immediately (Run Now)."""
    denied = _require("tasks", "execute")
    if denied:
        return denied

    task = ScheduledTask.query.get_or_404(task_id)
    if task.status not in ("pending", "failed"):
        return jsonify({"error": f"Cannot run task with status '{task.status}'"}), 400

    # Execute in background thread with app context
    from flask import current_app
    app = current_app._get_current_object()

    def _run_with_context():
        with app.app_context():
            _execute_task(task.id)

    thread = threading.Thread(target=_run_with_context, daemon=True)
    thread.start()

    audit(current_user, "run", "tasks", f"Manually triggered task #{task.id}: {task.name}")
    return jsonify({"status": "started", "task_id": task.id})


def _execute_task(task_id: int):
    """Execute a scheduled task. Must be called within app context."""
    import os
    import shutil
    import sys
    from pathlib import Path

    task = ScheduledTask.query.get(task_id)
    if not task or task.status == "running":
        return

    task.status = "running"
    task.started_at = datetime.now(timezone.utc)
    db.session.commit()

    try:
        workspace = Path(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

        if task.type in ("skill", "prompt"):
            # Import runner directly instead of shelling out
            runner_path = str(workspace / "ADWs")
            if runner_path not in sys.path:
                sys.path.insert(0, runner_path)

            from runner import run_skill, run_claude

            if task.type == "skill":
                result = run_skill(
                    task.payload,
                    log_name=f"task-{task.id}",
                    timeout=600,
                    agent=task.agent or None,
                )
            else:
                result = run_claude(
                    task.payload,
                    log_name=f"task-{task.id}",
                    timeout=600,
                    agent=task.agent or None,
                )

            task.status = "completed" if result.get("success") else "failed"
            task.result_summary = (result.get("stdout", "") or "")[:5000]
            if not result.get("success"):
                task.error = (result.get("stderr", "") or "")[:2000]

        elif task.type == "script":
            # Validate script path is within ADWs/routines/
            script_path = (workspace / "ADWs" / "routines" / task.payload).resolve()
            allowed_dir = (workspace / "ADWs" / "routines").resolve()
            if not str(script_path).startswith(str(allowed_dir)):
                raise ValueError(f"Script path escapes ADWs/routines/: {task.payload}")
            if not script_path.exists():
                raise FileNotFoundError(f"Script not found: {task.payload}")

            python_bin = shutil.which("uv")
            cmd_args = ["uv", "run", "python", str(script_path)] if python_bin else ["python3", str(script_path)]
            proc = subprocess.run(
                cmd_args, capture_output=True, text=True, timeout=900, cwd=str(workspace)
            )
            task.status = "completed" if proc.returncode == 0 else "failed"
            task.result_summary = (proc.stdout or "")[:5000]
            if proc.returncode != 0:
                task.error = (proc.stderr or "")[:2000]

        else:
            raise ValueError(f"Unknown task type: {task.type}")

    except subprocess.TimeoutExpired:
        task.status = "failed"
        task.error = "Timeout (15 min)"
    except Exception as e:
        task.status = "failed"
        task.error = str(e)[:2000]

    task.completed_at = datetime.now(timezone.utc)
    db.session.commit()
