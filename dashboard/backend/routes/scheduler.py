"""Scheduler endpoint — parse scheduler.py to extract schedule entries."""

import re
from flask import Blueprint, jsonify
from routes._helpers import WORKSPACE, safe_read

bp = Blueprint("scheduler", __name__)


# Agent mapping from script name (module level so _load_yaml_routines can access)
SCRIPT_AGENTS = {
        "review_todoist": "clawdia", "good_morning": "clawdia", "email_triage": "clawdia",
        "sync_meetings": "clawdia", "end_of_day": "clawdia", "memory_sync": "clawdia",
        "weekly_review": "clawdia", "trends": "clawdia", "dashboard": "clawdia",
        "community_daily": "pulse", "community_weekly": "pulse", "community_monthly": "pulse",
        "faq_sync": "pulse", "financial_pulse": "flux", "financial_weekly": "flux",
        "monthly_close": "flux", "licensing_daily": "atlas", "licensing_weekly": "atlas",
        "licensing_monthly": "atlas", "github_review": "atlas", "linear_review": "atlas",
        "memory_lint": "clawdia",
        "health_checkin": "kai", "strategy_digest": "sage",
        "social_analytics": "pixel", "youtube_report": "pixel", "instagram_report": "pixel",
        "linkedin_report": "pixel",
}


@bp.route("/api/scheduler")
def get_schedule():
    content = safe_read(WORKSPACE / "scheduler.py")
    if not content:
        return jsonify([])

    entries = []

    pattern = re.compile(
        r'schedule\.every\(([^)]*)\)\.'
        r'([\w.]+)'
        r'(?:\.at\(["\']([^"\']+)["\']\))?'
        r'\.do\(\s*(\w+)'
        r'(?:\s*,\s*["\']([^"\']*)["\'])?'
        r'(?:\s*,\s*["\']([^"\']*)["\'])?'
    )

    for m in pattern.finditer(content):
        interval, freq_chain, time_str, func_name, name_arg, script_arg = m.groups()

        # Determine frequency
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_match = [d for d in days if d in freq_chain.lower()]

        if day_match:
            frequency = "weekly"
            day_label = day_match[0].capitalize()
        elif "minute" in freq_chain:
            frequency = f"every {interval or '1'} min"
            day_label = ""
        elif "hour" in freq_chain:
            frequency = f"every {interval or '1'} hour"
            day_label = ""
        else:
            frequency = "daily"
            day_label = ""

        schedule_str = f"{frequency}"
        if day_label:
            schedule_str = f"{day_label}"
        if time_str:
            schedule_str += f" @ {time_str}"

        # Get real name from first arg, or derive from script
        task_name = name_arg or ""
        script = script_arg or ""

        if not task_name and script:
            task_name = script.replace(".py", "").replace("_", " ").title()

        # Get agent from script name (strip custom/ prefix and .py)
        script_key = script.replace("custom/", "").replace(".py", "") if script else ""
        agent = SCRIPT_AGENTS.get(script_key, "")

        entries.append({
            "name": task_name,
            "script": script,
            "schedule": schedule_str,
            "frequency": frequency,
            "time": time_str or "",
            "agent": agent,
            "custom": "custom/" in script,
        })

    # Also load custom routines from config/routines.yaml
    _load_yaml_routines(entries)

    return jsonify(entries)


def _load_yaml_routines(entries: list):
    """Load custom routines from config/routines.yaml."""
    import yaml
    config_path = WORKSPACE / "config" / "routines.yaml"
    if not config_path.exists():
        return

    try:
        with open(config_path) as f:
            config = yaml.safe_load(f)
        if not config:
            return

        for r in config.get("daily", []) or []:
            if not r.get("enabled", True):
                continue
            script = r.get("script", "")
            script_key = script.replace(".py", "")
            agent = SCRIPT_AGENTS.get(script_key, "")
            if r.get("interval"):
                sched = f"every {r['interval']} min"
            else:
                sched = f"daily @ {r.get('time', '?')}"
            entries.append({
                "name": r.get("name", script),
                "script": f"custom/{script}",
                "schedule": sched,
                "frequency": "daily",
                "time": r.get("time", ""),
                "agent": agent,
                "custom": True,
            })

        for r in config.get("weekly", []) or []:
            if not r.get("enabled", True):
                continue
            script = r.get("script", "")
            script_key = script.replace(".py", "")
            agent = SCRIPT_AGENTS.get(script_key, "")
            days = r.get("days", [r.get("day", "friday")])
            time_str = r.get("time", "09:00")
            for d in days:
                entries.append({
                    "name": r.get("name", script),
                    "script": f"custom/{script}",
                    "schedule": f"{d.capitalize()} @ {time_str}",
                    "frequency": "weekly",
                    "time": time_str,
                    "agent": agent,
                    "custom": True,
                })

        for r in config.get("monthly", []) or []:
            if not r.get("enabled", True):
                continue
            script = r.get("script", "")
            script_key = script.replace(".py", "")
            agent = SCRIPT_AGENTS.get(script_key, "")
            entries.append({
                "name": r.get("name", script),
                "script": f"custom/{script}",
                "schedule": f"Day {r.get('day', 1)} @ {r.get('time', '08:00')}",
                "frequency": "monthly",
                "time": r.get("time", ""),
                "agent": agent,
                "custom": True,
            })

    except Exception as e:
        print(f"Warning: Failed to load routines.yaml: {e}")
