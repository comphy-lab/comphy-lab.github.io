from __future__ import annotations

import importlib.util
import hashlib
import json
import os
import tempfile
import threading
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


ROOT = Path(__file__).resolve().parents[1]


def load_script(name: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, ROOT / "scripts" / name)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


purge = load_script("purge-website-cache.py", "purge_website_cache_tests")
manifest_builder = load_script("build-release-manifest.py", "manifest_builder_tests")


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


def release_manifest(git_sha: str = "a" * 40):
    return {
        "schema_version": 1,
        "git_sha": git_sha,
        "manifest_urls": ["https://comphy-lab.org/release-manifest.json"],
        "files": [
            {
                "path": "index.html",
                "sha256": "b" * 64,
                "urls": [
                    "https://comphy-lab.org/",
                    "https://comphy-lab.org/index.html",
                ],
            }
        ],
    }


class PurgePolicyTests(unittest.TestCase):
    def test_owned_paths_are_positive_and_project_routes_are_denied(self):
        for path in (
            "/",
            "/assets/site.css",
            "/research/",
            "/history/index.html",
            "/contact-card/",
            "/featured/Bubbles.jpg",
            "/sitemapindex.xml",
        ):
            self.assertTrue(purge.is_owned_path(path), path)
        for path in (
            "/docs/guide/",
            "/sl25/",
            "/sl2-demo/",
            "/api/status",
            "/regime-diagram/output",
            "/static/app.js",
            "/some-project/",
        ):
            self.assertFalse(purge.is_owned_path(path), path)

    def test_invalid_and_traversal_urls_are_rejected(self):
        bad_urls = (
            "https://evil.example/assets/app.js",
            "http://comphy-lab.org/assets/app.js",
            "https://comphy-lab.org/docs/../assets/app.js",
            "https://comphy-lab.org/assets/%2e%2e/docs/secret",
            "https://comphy-lab.org/assets/%252e%252e/secret",
            "https://comphy-lab.org//assets/app.js",
            "https://comphy-lab.org/assets/app.js?all=true",
        )
        for url in bad_urls:
            with self.subTest(url=url), self.assertRaises(purge.ReleaseError):
                purge.validate_url(url)

    def test_changed_and_deleted_urls_are_exactly_selected(self):
        previous = release_manifest()
        previous["files"].append(
            {
                "path": "assets/old.css",
                "sha256": "c" * 64,
                "urls": ["https://comphy-lab.org/assets/old.css"],
            }
        )
        current = release_manifest("d" * 40)
        current["files"][0]["sha256"] = "e" * 64
        self.assertEqual(
            purge.urls_to_purge(previous, current),
            [
                "https://comphy-lab.org/",
                "https://comphy-lab.org/assets/old.css",
                "https://comphy-lab.org/index.html",
                "https://comphy-lab.org/release-manifest.json",
            ],
        )


class CloudflareResponseTests(unittest.TestCase):
    def test_http_errors_fail_closed(self):
        for status in (401, 429, 500):
            error = HTTPError("https://api.cloudflare.test", status, "bad", {}, None)
            with self.subTest(status=status), patch.object(
                purge, "_open_no_redirect", side_effect=error
            ):
                with self.assertRaisesRegex(purge.ReleaseError, f"HTTP {status}"):
                    purge.purge_batch(
                        ["https://comphy-lab.org/"],
                        zone_id="1" * 32,
                        api_token="secret",
                    )

    def test_api_success_false_fails_closed(self):
        body = json.dumps({"success": False, "errors": [], "result": {}}).encode()
        with patch.object(
            purge, "_open_no_redirect", return_value=FakeResponse(200, body)
        ):
            with self.assertRaisesRegex(purge.ReleaseError, "did not confirm success"):
                purge.purge_batch(
                    ["https://comphy-lab.org/"],
                    zone_id="1" * 32,
                    api_token="secret",
                )

    def test_malformed_json_fails_closed(self):
        with patch.object(
            purge,
            "_open_no_redirect",
            return_value=FakeResponse(200, b"not json"),
        ):
            with self.assertRaisesRegex(purge.ReleaseError, "malformed JSON"):
                purge.purge_batch(
                    ["https://comphy-lab.org/"],
                    zone_id="1" * 32,
                    api_token="secret",
                )

    def test_missing_credentials_stop_before_network(self):
        with tempfile.TemporaryDirectory() as directory:
            previous = Path(directory) / "previous.json"
            previous.write_text("null\n", encoding="utf-8")
            args = Namespace(
                expected_sha="a" * 40,
                previous_manifest=previous,
                live_manifest_url="https://comphy-lab.org/release-manifest.json",
                live_attempts=1,
                live_delay=0,
            )
            with patch.dict(os.environ, {}, clear=True), patch.object(
                purge,
                "_open_no_redirect",
            ) as open_mock:
                with self.assertRaisesRegex(purge.ReleaseError, "credentials"):
                    purge.purge_release(args)
                open_mock.assert_not_called()

    def test_success_requires_empty_errors_and_receipt(self):
        response = {
            "success": True,
            "errors": [],
            "result": {"id": "f" * 32},
        }
        with patch.object(
            purge,
            "_open_no_redirect",
            return_value=FakeResponse(200, json.dumps(response).encode()),
        ):
            self.assertEqual(
                purge.purge_batch(
                    ["https://comphy-lab.org/"],
                    zone_id="1" * 32,
                    api_token="secret",
                ),
                "f" * 32,
            )

    def test_redirect_handler_never_constructs_a_forwarded_request(self):
        received = []

        class RedirectServer(BaseHTTPRequestHandler):
            def do_POST(self):
                received.append((self.path, self.headers.get("Authorization")))
                self.send_response(302)
                self.send_header("Location", "/credential-sink")
                self.end_headers()

            def log_message(self, _format, *_args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), RedirectServer)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            request = purge.Request(
                f"http://127.0.0.1:{server.server_port}/purge",
                data=b"{}",
                headers={"Authorization": "Bearer secret"},
                method="POST",
            )
            with self.assertRaises(HTTPError):
                purge._open_no_redirect(request, timeout=2)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)
        self.assertEqual(received, [("/purge", "Bearer secret")])

    def test_purge_batch_validates_direct_inputs_before_network(self):
        with patch.object(purge, "_open_no_redirect") as open_mock:
            with self.assertRaises(purge.ReleaseError):
                purge.purge_batch(
                    ["https://comphy-lab.org/docs/private"],
                    zone_id="not-a-zone",
                    api_token="secret",
                )
            open_mock.assert_not_called()

    def test_429_then_success_retries_the_same_batch(self):
        urls = ["https://comphy-lab.org/assets/app.css"]
        rate_limited = purge.ReleaseError("rate limited", status_code=429)
        with patch.object(
            purge,
            "purge_batch",
            side_effect=[rate_limited, "f" * 32],
        ) as purge_mock, patch.object(purge.time, "sleep") as sleep_mock:
            receipt = purge.purge_batch_with_retry(
                urls,
                zone_id="1" * 32,
                api_token="secret",
            )
        self.assertEqual(receipt, "f" * 32)
        self.assertEqual(purge_mock.call_count, 2)
        self.assertEqual(purge_mock.call_args_list[0], purge_mock.call_args_list[1])
        sleep_mock.assert_called_once_with(2.0)

    def test_repeated_429_stops_after_three_attempts(self):
        rate_limited = purge.ReleaseError("rate limited", status_code=429)
        with patch.object(
            purge,
            "purge_batch",
            side_effect=rate_limited,
        ) as purge_mock, patch.object(purge.time, "sleep") as sleep_mock:
            with self.assertRaises(purge.ReleaseError):
                purge.purge_batch_with_retry(
                    ["https://comphy-lab.org/assets/app.css"],
                    zone_id="1" * 32,
                    api_token="secret",
                )
        self.assertEqual(purge_mock.call_count, 3)
        self.assertEqual(
            [call.args[0] for call in purge_mock.call_args_list],
            [["https://comphy-lab.org/assets/app.css"]] * 3,
        )
        self.assertEqual(
            [call.args[0] for call in sleep_mock.call_args_list],
            [2.0, 4.0],
        )

    def test_401_is_not_retried(self):
        unauthorized = purge.ReleaseError("unauthorized", status_code=401)
        with patch.object(
            purge,
            "purge_batch",
            side_effect=unauthorized,
        ) as purge_mock, patch.object(purge.time, "sleep") as sleep_mock:
            with self.assertRaises(purge.ReleaseError):
                purge.purge_batch_with_retry(
                    ["https://comphy-lab.org/assets/app.css"],
                    zone_id="1" * 32,
                    api_token="secret",
                )
        purge_mock.assert_called_once()
        sleep_mock.assert_not_called()


class ManifestBuilderTests(unittest.TestCase):
    def test_file_hashing_reads_in_one_mebibyte_chunks(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "large.bin"
            content = b"a" * (manifest_builder.HASH_CHUNK_BYTES + 17)
            path.write_bytes(content)
            self.assertEqual(
                manifest_builder.sha256_file(path),
                hashlib.sha256(content).hexdigest(),
            )

    def test_manifest_is_deterministic_and_omits_unowned_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "assets").mkdir()
            (site / "assets" / "app.js").write_text("app", encoding="utf-8")
            (site / "research").mkdir()
            (site / "research" / "index.html").write_text("research", encoding="utf-8")
            (site / "docs").mkdir()
            (site / "docs" / "index.html").write_text("docs", encoding="utf-8")
            built = manifest_builder.build_manifest(site, "a" * 40)
            paths = [entry["path"] for entry in built["files"]]
            self.assertEqual(paths, ["assets/app.js", "research/index.html"])
            self.assertEqual(built, manifest_builder.build_manifest(site, "a" * 40))
            research = built["files"][1]
            self.assertEqual(
                research["urls"],
                [
                    "https://comphy-lab.org/research",
                    "https://comphy-lab.org/research/",
                    "https://comphy-lab.org/research/index.html",
                ],
            )

    def test_manifest_rejects_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            target = site / "target.css"
            target.write_text("body{}", encoding="utf-8")
            (site / "assets").mkdir()
            (site / "assets" / "link.css").symlink_to(target)
            with self.assertRaisesRegex(ValueError, "symbolic link"):
                manifest_builder.build_manifest(site, "a" * 40)


if __name__ == "__main__":
    unittest.main()
