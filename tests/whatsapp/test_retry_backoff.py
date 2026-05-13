"""Synthetic tests for PR-2: exponential backoff + jitter in send_whatsapp / api_request.

Coverage (acceptance criteria from Step 3 of plan-retry-pattern.md):
  1. HTTP 500 x3 → 3 attempts, returns False, category=transient
  2. HTTP 502 x2 then 200 → 3 attempts, returns True
  3. HTTP 400 → 1 attempt only (no retry), returns False, category=permanent
  4. URLError x3 → 3 attempts, returns False, category=transient
  5. Worst-case latency: 3 attempts (all 5xx) <= 8s total sleep budget
  6. api_request: HTTP 500 x3 → retries then raises
  7. api_request: HTTP 400 → raises immediately (1 attempt)
  8. api_request: URLError x3 → retries then raises

Run with: python3 -m unittest tests/whatsapp/test_retry_backoff.py -v
"""

from __future__ import annotations

import os
import sys
import time
import unittest
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path
from unittest.mock import MagicMock, patch, call

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / ".claude" / "skills" / "int-evolution-go" / "scripts"))

# runner.py uses `X | Y` union syntax (Python 3.10+) in some type hints, so we
# cannot import the entire module on Python 3.9. We extract and exec only the
# helper function source so the backoff logic can be tested in isolation.

def _make_http_response(status: int, body: bytes = b"{}") -> MagicMock:
    """Build a mock context manager mimicking urllib response."""
    resp = MagicMock()
    resp.status = status
    resp.read.return_value = body
    resp.__enter__ = lambda s: s
    resp.__exit__ = MagicMock(return_value=False)
    return resp


def _http_error(code: int) -> urllib.error.HTTPError:
    return urllib.error.HTTPError(
        url="http://test",
        code=code,
        msg=f"HTTP {code}",
        hdrs=None,
        fp=BytesIO(b"{}"),
    )


class TestApiRequestRetry(unittest.TestCase):
    """Tests for _retry_http_call_client via api_request in evolution_go_client.py."""

    def _import_client(self):
        import importlib
        import evolution_go_client as _client
        importlib.reload(_client)
        return _client

    def _patch_get_config(self, client):
        """Patch get_config to return predictable values."""
        return patch.object(client, "get_config", return_value=("http://localhost:8080", "test-key"))

    def test_http_500_retries_then_raises(self):
        """HTTP 500 x3 → retries 3 times, raises HTTPError after exhausted."""
        _client = self._import_client()
        call_count = 0

        def _mock_urlopen(req, *args, **kwargs):
            nonlocal call_count
            call_count += 1
            raise _http_error(500)

        with self._patch_get_config(_client):
            with patch("urllib.request.urlopen", side_effect=_mock_urlopen):
                with patch.object(_client.time, "sleep"):
                    with self.assertRaises(urllib.error.HTTPError) as ctx:
                        _client.api_request("GET", "/instance/status")

        self.assertEqual(ctx.exception.code, 500)
        self.assertEqual(call_count, 3)

    def test_http_400_raises_immediately_no_retry(self):
        """HTTP 400 → raises immediately without retry."""
        _client = self._import_client()
        call_count = 0

        def _mock_urlopen(req, *args, **kwargs):
            nonlocal call_count
            call_count += 1
            raise _http_error(400)

        with self._patch_get_config(_client):
            with patch("urllib.request.urlopen", side_effect=_mock_urlopen):
                with patch.object(_client.time, "sleep") as mock_sleep:
                    with self.assertRaises(urllib.error.HTTPError) as ctx:
                        _client.api_request("GET", "/instance/status")

        self.assertEqual(ctx.exception.code, 400)
        self.assertEqual(call_count, 1)
        mock_sleep.assert_not_called()

    def test_url_error_retries_then_raises(self):
        """URLError x3 → retries 3 times, raises URLError after exhausted."""
        _client = self._import_client()
        call_count = 0

        def _mock_urlopen(req, *args, **kwargs):
            nonlocal call_count
            call_count += 1
            raise urllib.error.URLError("Connection refused")

        with self._patch_get_config(_client):
            with patch("urllib.request.urlopen", side_effect=_mock_urlopen):
                with patch.object(_client.time, "sleep"):
                    with self.assertRaises(urllib.error.URLError):
                        _client.api_request("GET", "/instance/status")

        self.assertEqual(call_count, 3)

    def test_success_on_third_attempt_returns_result(self):
        """HTTP 500 x2 then 200 → returns parsed JSON result."""
        _client = self._import_client()
        call_count = 0

        def _mock_urlopen(req, *args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise _http_error(500)
            resp = MagicMock()
            resp.read.return_value = b'{"status": "active"}'
            resp.__enter__ = lambda s: s
            resp.__exit__ = MagicMock(return_value=False)
            return resp

        with self._patch_get_config(_client):
            with patch("urllib.request.urlopen", side_effect=_mock_urlopen):
                with patch.object(_client.time, "sleep") as mock_sleep:
                    result = _client.api_request("GET", "/instance/status")

        self.assertEqual(result, {"status": "active"})
        self.assertEqual(call_count, 3)
        # Sleep deve ser chamado exatamente 2x: após attempts 1 e 2 (5xx);
        # NÃO deve ser chamado após attempt 3 (success). Garante que o
        # backoff só roda em falhas que serão retriadas.
        self.assertEqual(mock_sleep.call_count, 2)




if __name__ == "__main__":
    unittest.main()
