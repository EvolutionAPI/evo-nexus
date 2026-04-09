"""Flask backend for the workspace dashboard — OpenClaude."""

import os
import sys
import secrets
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, current_user

# Workspace root: two levels up from backend/
WORKSPACE = Path(__file__).resolve().parent.parent.parent

# Load .env from workspace root
load_dotenv(WORKSPACE / ".env")

# Add social-auth to path
sys.path.insert(0, str(WORKSPACE / "social-auth"))

app = Flask(__name__, static_folder=None)
# Persist secret key so sessions survive restarts
_secret_key = os.environ.get("OPENCLAUDE_SECRET_KEY")
if not _secret_key:
    _key_file = WORKSPACE / "dashboard" / "data" / ".secret_key"
    _key_file.parent.mkdir(parents=True, exist_ok=True)
    if _key_file.exists():
        _secret_key = _key_file.read_text().strip()
    else:
        _secret_key = secrets.token_hex(32)
        _key_file.write_text(_secret_key)
        _key_file.chmod(0o600)

app.secret_key = _secret_key
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{WORKSPACE / 'dashboard' / 'data' / 'openclaude.db'}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=30)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# --------------- Database ---------------
from models import db, User, needs_setup, seed_roles
db.init_app(app)

# Create tables on first run + enable WAL mode for concurrent reads
with app.app_context():
    db.create_all()
    db.session.execute(db.text("PRAGMA journal_mode=WAL"))
    db.session.commit()
    seed_roles()

# --------------- Licensing (auto-register + heartbeat + shutdown) ───
import atexit
from licensing import start_heartbeat, on_shutdown, auto_register_if_needed

with app.app_context():
    auto_register_if_needed()

start_heartbeat(app)
atexit.register(on_shutdown, app)

# --------------- Login Manager ---------------
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Authentication required"}), 401

# --------------- Auth Middleware ---------------
PUBLIC_PATHS = {
    "/api/auth/login",
    "/api/auth/needs-setup",
    "/api/auth/setup",
    "/api/config/workspace-status",
}

@app.before_request
def auth_middleware():
    path = request.path

    # Static assets and frontend
    if not path.startswith("/api/") and not path.startswith("/ws/"):
        return None

    # WebSocket — skip (handled separately)
    if path.startswith("/ws/"):
        return None

    # Public API paths (exact match or prefix match for docs)
    if path in PUBLIC_PATHS or path.startswith("/api/docs"):
        return None

    # Setup redirect — if no users, only allow setup endpoints
    if needs_setup():
        if path not in PUBLIC_PATHS:
            return jsonify({"error": "Setup required", "needs_setup": True}), 403

    # Require auth for all other API paths
    if not current_user.is_authenticated:
        return jsonify({"error": "Authentication required"}), 401

# --------------- Register blueprints ---------------
from routes.overview import bp as overview_bp
from routes.reports import bp as reports_bp
from routes.agents import bp as agents_bp
from routes.routines import bp as routines_bp
from routes.skills import bp as skills_bp
from routes.templates_routes import bp as templates_bp
from routes.memory import bp as memory_bp
from routes.costs import bp as costs_bp
from routes.config import bp as config_bp
from routes.files import bp as files_bp
from routes.integrations import bp as integrations_bp
from routes.scheduler import bp as scheduler_bp
from routes.services import bp as services_bp
from routes.auth_routes import bp as auth_bp
from routes.systems import bp as systems_bp
from routes.docs import bp as docs_bp
from routes.mempalace import bp as mempalace_bp

app.register_blueprint(overview_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(agents_bp)
app.register_blueprint(routines_bp)
app.register_blueprint(skills_bp)
app.register_blueprint(templates_bp)
app.register_blueprint(memory_bp)
app.register_blueprint(costs_bp)
app.register_blueprint(config_bp)
app.register_blueprint(files_bp)
app.register_blueprint(integrations_bp)
app.register_blueprint(scheduler_bp)
app.register_blueprint(services_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(systems_bp)
app.register_blueprint(docs_bp)
app.register_blueprint(mempalace_bp)

# --------------- Terminal WebSocket ---------------
from routes.terminal import bp as terminal_bp, init_websocket
app.register_blueprint(terminal_bp)
init_websocket(app)

# --------------- Social Auth blueprints ---------------
from auth.youtube import bp as youtube_auth_bp
from auth.instagram import bp as instagram_auth_bp
from auth.linkedin import bp as linkedin_auth_bp
from auth.twitter import bp as twitter_auth_bp
from auth.tiktok import bp as tiktok_auth_bp
from auth.twitch import bp as twitch_auth_bp

app.register_blueprint(youtube_auth_bp)
app.register_blueprint(instagram_auth_bp)
app.register_blueprint(linkedin_auth_bp)
app.register_blueprint(twitter_auth_bp)
app.register_blueprint(tiktok_auth_bp)
app.register_blueprint(twitch_auth_bp)

@app.route("/api/version")
def api_version():
    """Return current version from pyproject.toml."""
    try:
        pyproject = WORKSPACE / "pyproject.toml"
        for line in pyproject.read_text().splitlines():
            if line.startswith("version"):
                return {"version": line.split('"')[1]}
    except Exception:
        pass
    return {"version": "unknown"}

@app.route("/api/social-accounts")
def social_accounts():
    from env_manager import all_platforms_with_accounts
    return {"platforms": all_platforms_with_accounts()}

# --------------- Serve React build ---------------
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    full = FRONTEND_DIST / path
    if full.is_file():
        return send_from_directory(str(FRONTEND_DIST), path)
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return send_from_directory(str(FRONTEND_DIST), "index.html")
    return {"error": "Frontend not built. Run npm build in frontend/"}, 404


if __name__ == "__main__":
    # Read port from workspace.yaml or env, fallback to 8080
    port = int(os.environ.get("OPENCLAUDE_PORT", 8080))
    try:
        import yaml
        config_path = WORKSPACE / "config" / "workspace.yaml"
        if config_path.is_file():
            with open(config_path) as f:
                cfg = yaml.safe_load(f)
            if cfg and cfg.get("port"):
                port = int(cfg["port"])
    except Exception:
        pass
    # Start scheduler in background thread
    import threading
    def _run_scheduler():
        log_path = WORKSPACE / "ADWs" / "logs" / "scheduler.log"
        log_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("scheduler", WORKSPACE / "scheduler.py")
            sched_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(sched_module)
            sched_module.setup_schedule()

            import schedule as sched_lib
            import time as _time
            from datetime import datetime as _dt

            with open(log_path, "a") as log:
                log.write(f"\n[{_dt.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduler started ({len(sched_lib.get_jobs())} routines)\n")
                log.flush()

                while True:
                    sched_lib.run_pending()
                    _time.sleep(30)
        except Exception as e:
            with open(log_path, "a") as log:
                log.write(f"Scheduler error: {e}\n")
            print(f"Scheduler failed to start: {e}")

    sched_thread = threading.Thread(target=_run_scheduler, daemon=True, name="scheduler")
    sched_thread.start()
    print(f"  Scheduler started in background")

    app.run(host="0.0.0.0", port=port, debug=False)
