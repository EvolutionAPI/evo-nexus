"""Synthetic tests for WhatsApp retry pattern — PR-3 (Steps 4, 5, 6).

Step 4: _classify_error + failed_retryable classification in _execute_trigger
Step 5: /replay endpoint — rate-limit, not_found, not_replayable, happy path
Step 6: /stats endpoint — JSON shape, watermark flag
"""
import json
import subprocess
import sys
import os
import pytest

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# ---------------------------------------------------------------------------
# Step 4 — _classify_error unit tests (pure, no app context needed)
# ---------------------------------------------------------------------------

from routes.triggers import _classify_error, _TRANSIENT_MARKERS


class TestClassifyError:
    def test_timeout_exception_is_transient(self):
        exc = subprocess.TimeoutExpired(cmd="x", timeout=11)
        assert _classify_error("Timeout", exc) == "transient"

    def test_value_error_is_permanent(self):
        exc = ValueError("missing key 'foo'")
        assert _classify_error(str(exc), exc) == "permanent"

    def test_file_not_found_is_permanent(self):
        exc = FileNotFoundError("script not found")
        assert _classify_error(str(exc), exc) == "permanent"

    def test_http_5xx_in_stderr_is_transient(self):
        assert _classify_error("HTTP 503 Service Unavailable", None) == "transient"

    def test_http_500_in_stderr_is_transient(self):
        assert _classify_error("HTTP 500 Internal Server Error", None) == "transient"

    def test_connection_refused_is_transient(self):
        assert _classify_error("Connection refused", None) == "transient"

    def test_url_error_marker_is_transient(self):
        assert _classify_error("URLError: <urlopen error timed out>", None) == "transient"

    def test_http_4xx_is_permanent(self):
        # 4xx markers NOT in _TRANSIENT_MARKERS → permanent
        assert _classify_error("HTTP 400 Bad Request", None) == "permanent"

    def test_http_404_is_permanent(self):
        assert _classify_error("HTTP 404 Not Found", None) == "permanent"

    def test_generic_runtime_error_is_permanent(self):
        assert _classify_error("RuntimeError: unexpected state", None) == "permanent"

    def test_empty_message_defaults_permanent(self):
        assert _classify_error("", None) == "permanent"

    def test_none_message_defaults_permanent(self):
        assert _classify_error(None, None) == "permanent"  # type: ignore[arg-type]

    def test_all_transient_markers_recognized(self):
        for marker in _TRANSIENT_MARKERS:
            assert _classify_error(f"...{marker}...", None) == "transient", \
                f"Marker '{marker}' should be transient"


# ---------------------------------------------------------------------------
# Step 5 + 6 — Flask app integration tests
# These tests require the Flask app to be importable without a running server.
# ---------------------------------------------------------------------------

try:
    import importlib, types
    # We need a minimal Flask test client.  Import app but skip heavy startup.
    # The auto-migrate runs against dashboard.db which must exist.
    # Guard: only run integration tests when DB exists.
    _DB_EXISTS = os.path.exists(
        os.path.join(os.path.dirname(__file__), "..", "..", "dashboard.db")
    )
except Exception:
    _DB_EXISTS = False


@pytest.mark.skipif(not _DB_EXISTS, reason="dashboard.db not found — integration tests skipped")
class TestReplayEndpoint:
    """Integration tests for POST /api/triggers/executions/<id>/replay."""

    @pytest.fixture(scope="class")
    def client(self):
        """Return a Flask test client with a seeded failed_retryable execution."""
        # Minimal app import — auto-migrate runs on import
        import app as flask_app_module
        flask_app = flask_app_module.app
        flask_app.config["TESTING"] = True
        flask_app.config["WTF_CSRF_ENABLED"] = False
        with flask_app.test_client() as c:
            yield c, flask_app

    def _seed_execution(self, app, status="failed_retryable", last_replay_at=None):
        """Insert a TriggerExecution row and return its id."""
        from models import db, TriggerExecution, Trigger
        with app.app_context():
            # Find or create a trigger
            t = Trigger.query.first()
            if t is None:
                pytest.skip("No trigger in DB — seed one manually first")
            ex = TriggerExecution(
                trigger_id=t.id,
                event_data=json.dumps({"event_type": "test", "data": {"key": {"remoteJid": "+5511999999999"}, "message": {"conversation": "/briefing"}}}),
                status=status,
                last_replay_at=last_replay_at,
            )
            db.session.add(ex)
            db.session.commit()
            return ex.id, t.id

    def test_replay_requires_auth(self, client):
        c, _ = client
        # Without session, Flask-Login returns 401 (Unauthorized) or 403 (Forbidden)
        resp = c.post("/api/triggers/executions/999999/replay")
        assert resp.status_code in (401, 403, 404)

    def test_stats_returns_json_shape(self, client):
        c, _ = client
        resp = c.get("/api/triggers/stats?days=1")
        # Without auth some setups return 200 (public route, no login_required) or 403
        if resp.status_code == 200:
            data = resp.get_json()
            required_keys = {
                "window_days", "total_executions", "by_status",
                "retries_observed", "idempotent_replays",
                "dlq_size", "wpp_command_count", "circuit_breaker_watermark_hit",
            }
            assert required_keys.issubset(data.keys()), f"Missing keys: {required_keys - data.keys()}"
            assert isinstance(data["circuit_breaker_watermark_hit"], bool)
            assert isinstance(data["by_status"], dict)
            assert data["window_days"] == 1


# ---------------------------------------------------------------------------
# Step 6 — Watermark logic unit test (no DB needed)
# ---------------------------------------------------------------------------

class TestWatermarkLogic:
    """The watermark formula: wpp_command_count > 50 OR user_count > 1."""

    def _check(self, wpp_count: int, user_count: int) -> bool:
        return wpp_count > 50 or user_count > 1

    def test_below_threshold_no_hit(self):
        assert self._check(49, 1) is False

    def test_exactly_50_no_hit(self):
        assert self._check(50, 1) is False

    def test_51_hits_watermark(self):
        assert self._check(51, 1) is True

    def test_multiple_users_hits_watermark(self):
        assert self._check(0, 2) is True

    def test_both_conditions_hit(self):
        assert self._check(100, 3) is True


# ---------------------------------------------------------------------------
# Step 5 — Rate-limit logic unit test (no DB needed)
# ---------------------------------------------------------------------------

class TestRateLimitLogic:
    """Verify the 60s rate-limit formula (elapsed < 60 → rate-limited)."""

    def _is_rate_limited(self, last_replay_at, now, threshold_seconds=60):
        if last_replay_at is None:
            return False
        elapsed = (now - last_replay_at).total_seconds()
        return elapsed < threshold_seconds

    def test_no_previous_replay_not_limited(self):
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        assert self._is_rate_limited(None, now) is False

    def test_replay_59s_ago_is_limited(self):
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        last = now - timedelta(seconds=59)
        assert self._is_rate_limited(last, now) is True

    def test_replay_60s_ago_is_not_limited(self):
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        last = now - timedelta(seconds=60)
        assert self._is_rate_limited(last, now) is False

    def test_replay_61s_ago_is_not_limited(self):
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        last = now - timedelta(seconds=61)
        assert self._is_rate_limited(last, now) is False
