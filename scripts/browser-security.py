#!/usr/bin/env python3
"""Check built HTML and render the route-scoped Cloudflare header rule."""

import argparse
import base64
import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


def route_policy():
    spec = importlib.util.spec_from_file_location(
        "website_purge", ROOT / "scripts/purge-website-cache.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def headers():
    values = json.loads((ROOT / "security/response-headers.json").read_text())
    for name, value in values.items():
        if "\n" in value or "\r" in value or len(value.encode()) > 4096:
            raise ValueError(f"Invalid response header: {name}")
    return values


def cloudflare_rule(report_only=False):
    policy = route_policy()
    exact = " ".join(json.dumps(p) for p in sorted(policy.OWNED_EXACT_PATHS))
    prefixes = " or ".join(
        f"starts_with(http.request.uri.path, {json.dumps(p)})"
        for p in sorted(policy.OWNED_DIRECTORY_ROOTS)
    )
    expression = (
        '(http.host eq "comphy-lab.org" and '
        f'(http.request.uri.path in {{{exact}}} or {prefixes}))'
    )
    values = headers()
    if report_only:
        values["Content-Security-Policy-Report-Only"] = values.pop(
            "Content-Security-Policy"
        )
    return {
        "ref": "public_website_browser_security",
        "description": "Public website browser security (owned routes only)",
        "expression": expression,
        "action": "rewrite",
        "action_parameters": {
            "headers": {
                name.lower(): {"operation": "set", "value": value}
                for name, value in values.items()
            }
        },
        "enabled": True,
    }


class ScriptInventory(HTMLParser):
    def __init__(self, document, site_dir):
        super().__init__(convert_charrefs=True)
        self.document = document
        self.site_dir = site_dir.resolve()
        self.errors = []
        self.scripts = 0

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        for name, value in attrs:
            if name.startswith("on"):
                self.errors.append(f"inline handler {name}")
            if name in {"src", "href", "action"} and value:
                if value.lstrip().lower().startswith("javascript:"):
                    self.errors.append("javascript URL")
        if tag != "script":
            return
        script_type = attr.get("type", "").strip().lower()
        if script_type in {"application/ld+json", "application/json"}:
            return
        self.scripts += 1
        source = attr.get("src")
        if not source:
            # Reject at the opening tag: HTMLParser does not flush an
            # unterminated script's raw text even when close() is called.
            self.errors.append("executable inline script")
            return
        parsed = urlsplit(source)
        if parsed.scheme or parsed.netloc or not source.startswith("/"):
            self.errors.append(f"nonlocal executable dependency: {source}")
            return
        asset = (self.site_dir / unquote(parsed.path).lstrip("/")).resolve()
        if not asset.is_relative_to(self.site_dir) or not asset.is_file():
            self.errors.append(f"missing or invalid executable: {source}")
            return
        if source.startswith("/assets/vendor/"):
            expected = "sha384-" + base64.b64encode(
                hashlib.sha384(asset.read_bytes()).digest()
            ).decode()
            if attr.get("integrity") != expected:
                self.errors.append(f"vendor integrity mismatch: {source}")

def check_security_txt(path):
    text = path.read_text(encoding="utf-8")
    fields = {}
    for line in text.splitlines():
        if line and not line.startswith("#"):
            if ":" not in line:
                raise ValueError("security.txt contains a malformed field")
            name, value = line.split(":", 1)
            fields.setdefault(name, []).append(value.strip())
    contacts = fields.get("Contact", [])
    if not contacts or any(
        urlsplit(contact).scheme not in {"mailto", "https"} for contact in contacts
    ):
        raise ValueError("security.txt needs a mailto or HTTPS Contact")
    if len(fields.get("Expires", [])) != 1:
        raise ValueError("security.txt needs exactly one Expires field")
    expiry = datetime.fromisoformat(fields["Expires"][0].replace("Z", "+00:00"))
    if expiry.tzinfo is None or expiry <= datetime.now(timezone.utc):
        raise ValueError("security.txt has expired or lacks a timezone")
    if fields.get("Canonical") != [
        "https://comphy-lab.org/.well-known/security.txt"
    ]:
        raise ValueError("security.txt has an unexpected canonical URL")


def check(site_dir):
    policy = route_policy()
    headers()
    failures = []
    documents = 0
    scripts = 0
    for path in sorted(site_dir.rglob("*.html")):
        relative = "/" + path.relative_to(site_dir).as_posix()
        if not policy.is_owned_path(relative):
            continue
        parser = ScriptInventory(path, site_dir)
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        documents += 1
        scripts += parser.scripts
        failures.extend(f"{relative}: {error}" for error in parser.errors)
    check_security_txt(site_dir / ".well-known/security.txt")
    if not documents:
        failures.append("No owned HTML documents were checked")
    if failures:
        raise ValueError("\n".join(failures))
    print(f"Browser security: {documents} documents, {scripts} local scripts; security.txt valid")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["check", "cloudflare-rule"])
    parser.add_argument("--site-dir", type=Path, default=ROOT / "_site")
    parser.add_argument("--report-only", action="store_true")
    args = parser.parse_args()
    if args.command == "check":
        check(args.site_dir)
    else:
        print(json.dumps(cloudflare_rule(args.report_only), indent=2))


if __name__ == "__main__":
    main()
