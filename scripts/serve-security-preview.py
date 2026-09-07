#!/usr/bin/env python3
"""Serve the built site locally with the exact proposed response headers."""

import argparse
import importlib.util
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location(
    "browser_security", ROOT / "scripts/browser-security.py"
)
security = importlib.util.module_from_spec(spec)
spec.loader.exec_module(security)


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        path = urlsplit(self.path).path
        if security.route_policy().is_owned_path(path):
            for name, value in security.headers().items():
                self.send_header(name, value)
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        if str(path).endswith(".txt"):
            return "text/plain; charset=utf-8"
        return super().guess_type(path)

    def do_GET(self):
        # These probes exist only in the loopback preview, never in the artifact.
        path = urlsplit(self.path).path
        fixtures = {
            "/about/__security-probe__.html": (
                "text/html; charset=utf-8",
                '<!doctype html><title>CSP probe</title>'
                '<script src="/assets/js/__security-probe__.js"></script>'
                '<script>document.documentElement.dataset.inline="executed";</script>'
                '<script src="https://example.com/unauthorized.js"></script>'
                '<button onclick="this.dataset.handler=\'executed\'">Probe handler</button>'
                '<p>Only the approved local script should execute.</p>',
            ),
            "/assets/js/__security-probe__.js": (
                "text/javascript",
                'document.documentElement.dataset.allowed="executed";',
            ),
            "/__frame-probe__.html": (
                "text/html; charset=utf-8",
                '<!doctype html><title>Framing probe</title>'
                '<iframe src="/about/__security-probe__.html"></iframe>',
            ),
        }
        if path in fixtures:
            mime, body = fixtures[path]
            encoded = body.encode()
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return
        return super().do_GET()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--site-dir", type=Path, default=ROOT / "_site")
    args = parser.parse_args()
    server = ThreadingHTTPServer(
        ("127.0.0.1", args.port), partial(PreviewHandler, directory=str(args.site_dir))
    )
    print(f"Security preview: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
