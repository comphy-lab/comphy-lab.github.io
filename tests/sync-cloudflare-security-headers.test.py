from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location(
    "sync_cloudflare_security_headers",
    ROOT / "scripts/sync-cloudflare-security-headers.py",
)
sync = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(sync)


class FakeResponse:
    def __init__(self, status: int, body: bytes):
        self.status = status
        self._body = body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, limit: int = -1) -> bytes:
        return self._body if limit < 0 else self._body[:limit]


def sample_desired():
    return {
        "ref": "public_website_browser_security",
        "description": "Public website browser security (owned routes only)",
        "expression": '(http.host eq "comphy-lab.org")',
        "action": "rewrite",
        "action_parameters": {
            "headers": {
                "content-security-policy": {
                    "operation": "set",
                    "value": "default-src 'self'; style-src 'self'",
                }
            }
        },
        "enabled": True,
    }


def sample_ruleset(*, csp: str = "default-src 'self'"):
    return {
        "id": "ruleset-1",
        "rules": [
            {
                "id": "sibling-1",
                "ref": "other_rule",
                "description": "Unrelated sibling",
                "expression": "true",
                "action": "rewrite",
                "action_parameters": {
                    "headers": {
                        "x-test": {"operation": "set", "value": "keep"}
                    }
                },
                "enabled": True,
                "version": "3",
                "last_updated": "2026-01-01T00:00:00Z",
            },
            {
                "id": "rule-security",
                "ref": "public_website_browser_security",
                "description": "Public website browser security (owned routes only)",
                "expression": "old",
                "action": "rewrite",
                "action_parameters": {
                    "headers": {
                        "content-security-policy": {
                            "operation": "set",
                            "value": csp,
                        }
                    }
                },
                "enabled": True,
                "version": "9",
                "last_updated": "2026-01-01T00:00:00Z",
            },
        ],
    }


class MergeTests(unittest.TestCase):
    def test_merge_updates_named_rule_and_keeps_siblings(self):
        rules, updated = sync.merge_rules(sample_ruleset()["rules"], sample_desired())
        self.assertEqual(len(rules), 2)
        self.assertEqual(rules[0]["id"], "sibling-1")
        self.assertEqual(rules[0]["action_parameters"]["headers"]["x-test"]["value"], "keep")
        self.assertNotIn("version", rules[0])
        self.assertNotIn("last_updated", rules[0])
        self.assertEqual(rules[1]["id"], "rule-security")
        self.assertEqual(rules[1]["expression"], sample_desired()["expression"])
        self.assertEqual(updated["id"], "rule-security")

    def test_match_by_exact_description_when_ref_missing(self):
        existing = sample_ruleset()["rules"]
        del existing[1]["ref"]
        existing[1]["description"] = sync.RULE_DESCRIPTION
        rules, _updated = sync.merge_rules(existing, sample_desired())
        self.assertEqual(rules[1]["id"], "rule-security")

    def test_description_prefix_alone_does_not_match(self):
        existing = sample_ruleset()["rules"]
        del existing[1]["ref"]
        existing[1]["description"] = (
            "Public website browser security audit"
        )
        with self.assertRaisesRegex(sync.SyncError, "exactly one"):
            sync.merge_rules(existing, sample_desired())

    def test_missing_or_duplicate_target_fails(self):
        with self.assertRaisesRegex(sync.SyncError, "exactly one"):
            sync.merge_rules([sample_ruleset()["rules"][0]], sample_desired())
        duplicate = sample_ruleset()["rules"] + [dict(sample_ruleset()["rules"][1])]
        with self.assertRaisesRegex(sync.SyncError, "exactly one"):
            sync.merge_rules(duplicate, sample_desired())


class SyncFlowTests(unittest.TestCase):
    def test_sync_puts_merged_ruleset_and_reports_fonts_flag(self):
        get_body = json.dumps(
            {
                "success": True,
                "errors": [],
                "result": sample_ruleset(
                    csp="style-src https://fonts.googleapis.com"
                ),
            }
        ).encode()
        put_result = sample_ruleset(csp="default-src 'self'; style-src 'self'")
        put_result["rules"][1]["expression"] = sample_desired()["expression"]
        put_body = json.dumps(
            {"success": True, "errors": [], "result": put_result}
        ).encode()
        calls = []

        def fake_open(request, timeout=30.0):
            calls.append((request.get_method(), request.full_url, request.data))
            if request.get_method() == "GET":
                return FakeResponse(200, get_body)
            return FakeResponse(200, put_body)

        env = {
            "CLOUDFLARE_ZONE_ID": "1" * 32,
            "CLOUDFLARE_API_TOKEN": "secret-token",
        }
        with patch.dict("os.environ", env, clear=False), patch.object(
            sync.purge, "_open_no_redirect", side_effect=fake_open
        ), patch.object(sync.security, "cloudflare_rule", return_value=sample_desired()):
            receipt = sync.sync()

        self.assertEqual(receipt["rule_id"], "rule-security")
        self.assertIs(receipt["csp_contains_fonts_googleapis"], False)
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0][0], "GET")
        self.assertEqual(calls[1][0], "PUT")
        put_payload = json.loads(calls[1][2].decode())
        self.assertEqual(len(put_payload["rules"]), 2)
        self.assertEqual(put_payload["rules"][0]["id"], "sibling-1")
        self.assertEqual(put_payload["rules"][1]["id"], "rule-security")
        self.assertEqual(
            put_payload["rules"][1]["expression"],
            sample_desired()["expression"],
        )

    def test_api_http_error_fails_closed(self):
        error = HTTPError("https://api.cloudflare.test", 403, "denied", {}, None)
        env = {
            "CLOUDFLARE_ZONE_ID": "1" * 32,
            "CLOUDFLARE_API_TOKEN": "secret-token",
        }
        with patch.dict("os.environ", env, clear=False), patch.object(
            sync.purge, "_open_no_redirect", side_effect=error
        ), patch.object(sync.security, "cloudflare_rule", return_value=sample_desired()):
            with self.assertRaisesRegex(sync.SyncError, "HTTP 403"):
                sync.sync()

    def test_csp_fonts_detection(self):
        self.assertTrue(
            sync.csp_contains_fonts_googleapis(
                {
                    "action_parameters": {
                        "headers": {
                            "content-security-policy": {
                                "operation": "set",
                                "value": "style-src https://fonts.googleapis.com",
                            }
                        }
                    }
                }
            )
        )
        self.assertFalse(sync.csp_contains_fonts_googleapis(sample_desired()))


if __name__ == "__main__":
    unittest.main()
