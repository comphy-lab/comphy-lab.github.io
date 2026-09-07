#!/usr/bin/env python3
"""Purge only CoMPhy Lab website URLs after proving a release is live."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlencode, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


ORIGIN = "https://comphy-lab.org"
MANIFEST_PATH = "/release-manifest.json"
SCHEMA_VERSION = 1
MAX_PURGE_URLS = 100
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
USER_AGENT = "CoMPhy-Website-Publisher/1.0"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
ZONE_RE = re.compile(r"^[0-9a-f]{32}$")
SAFE_SEGMENT_RE = re.compile(r"^[A-Za-z0-9._~!$&'()*+,;=:@%-]+$")

OWNED_DIRECTORY_ROOTS = frozenset(
    {
        "/about/",
        "/assets/",
        "/contact/",
        "/contact-card/",
        "/featured/",
        "/history/",
        "/join/",
        "/news/",
        "/research/",
        "/team/",
        "/teaching/",
    }
)
OWNED_EXACT_PATHS = frozenset(
    {
        "/",
        "/404.html",
        "/News.md",
        "/about.html",
        "/contact.html",
        "/feed.xml",
        "/history",
        "/history.html",
        "/history/",
        "/index.html",
        "/release-manifest.json",
        "/robots.txt",
        "/sitemap.xml",
        "/sitemapindex.xml",
        "/.well-known/security.txt",
        *(
            path
            for root in (
                "about",
                "contact",
                "contact-card",
                "featured",
                "history",
                "join",
                "news",
                "research",
                "team",
                "teaching",
            )
            for path in (f"/{root}", f"/{root}/")
        ),
    }
)
DENIED_ROOTS = frozenset({"add", "api", "batch", "docs", "regime", "static"})


class ReleaseError(RuntimeError):
    """A release or purge response failed closed validation."""

    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class NoRedirectHandler(HTTPRedirectHandler):
    """Refuse redirects so authorization is never replayed to another URL."""

    def redirect_request(self, *_args: Any, **_kwargs: Any) -> None:
        return None


def _open_no_redirect(request: Request, *, timeout: float) -> Any:
    return build_opener(NoRedirectHandler()).open(request, timeout=timeout)


def _decoded_path(path: str) -> str:
    if not path.startswith("/") or path.startswith("//"):
        raise ReleaseError("URL path must be absolute with one leading slash")
    if "\\" in path or any(ord(char) < 32 for char in path):
        raise ReleaseError("URL path contains unsafe characters")

    segments = path.split("/")
    decoded_segments: list[str] = []
    for segment in segments[1:]:
        if segment and not SAFE_SEGMENT_RE.fullmatch(segment):
            raise ReleaseError("URL path contains a non-canonical segment")
        decoded = unquote(segment)
        if decoded in {".", ".."} or "/" in decoded or "\\" in decoded:
            raise ReleaseError("URL path contains traversal")
        if "%" in decoded:
            decoded_twice = unquote(decoded)
            if decoded_twice != decoded:
                raise ReleaseError("URL path contains nested encoding")
        decoded_segments.append(decoded)
    return "/" + "/".join(decoded_segments)


def is_owned_path(path: str) -> bool:
    """Return whether a canonical URL path belongs to the main website."""
    try:
        decoded = _decoded_path(path)
    except ReleaseError:
        return False

    if decoded in OWNED_EXACT_PATHS:
        return True
    first = decoded.lstrip("/").split("/", 1)[0].casefold()
    if (
        first in DENIED_ROOTS
        or first.startswith("sl2")
        or first.startswith("sl25")
        or first.startswith("regime-diagram")
    ):
        return False
    return f"/{first}/" in OWNED_DIRECTORY_ROOTS


def validate_url(value: Any) -> str:
    if not isinstance(value, str):
        raise ReleaseError("manifest URL must be a string")
    parsed = urlsplit(value)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "comphy-lab.org"
        or parsed.netloc != "comphy-lab.org"
        or parsed.query
        or parsed.fragment
    ):
        raise ReleaseError("manifest URL is outside the website origin")
    if not is_owned_path(parsed.path):
        raise ReleaseError("manifest URL is outside the owned website paths")
    return value


def validate_credentials(zone_id: str, api_token: str) -> None:
    if not ZONE_RE.fullmatch(zone_id):
        raise ReleaseError("Cloudflare zone ID is invalid")
    if (
        not api_token
        or api_token != api_token.strip()
        or len(api_token) > 2048
        or any(ord(char) < 33 or ord(char) == 127 for char in api_token)
    ):
        raise ReleaseError("Cloudflare API token is invalid")


def validate_manifest(data: Any, expected_sha: str | None = None) -> dict[str, Any]:
    if not isinstance(data, dict) or set(data) != {
        "schema_version",
        "git_sha",
        "manifest_urls",
        "files",
    }:
        raise ReleaseError("release manifest has an invalid top-level schema")
    if data["schema_version"] != SCHEMA_VERSION:
        raise ReleaseError("release manifest schema version is unsupported")
    git_sha = data["git_sha"]
    if not isinstance(git_sha, str) or not SHA_RE.fullmatch(git_sha):
        raise ReleaseError("release manifest Git SHA is invalid")
    if expected_sha is not None and git_sha != expected_sha:
        raise ReleaseError("live release manifest does not match the deployed Git SHA")

    manifest_urls = data["manifest_urls"]
    if manifest_urls != [ORIGIN + MANIFEST_PATH]:
        raise ReleaseError("release manifest metadata URL is invalid")
    files = data["files"]
    if not isinstance(files, list):
        raise ReleaseError("release manifest files must be a list")

    seen_paths: set[str] = set()
    previous_path = ""
    for entry in files:
        if not isinstance(entry, dict) or set(entry) != {"path", "sha256", "urls"}:
            raise ReleaseError("release manifest file entry is invalid")
        path = entry["path"]
        digest = entry["sha256"]
        urls = entry["urls"]
        if (
            not isinstance(path, str)
            or not path
            or path.startswith("/")
            or "\\" in path
            or any(part in {"", ".", ".."} for part in path.split("/"))
        ):
            raise ReleaseError("release manifest file path is invalid")
        if path <= previous_path or path in seen_paths:
            raise ReleaseError("release manifest file paths are not unique and sorted")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise ReleaseError("release manifest file digest is invalid")
        if not isinstance(urls, list) or not urls or urls != sorted(set(urls)):
            raise ReleaseError("release manifest URLs are not unique and sorted")
        for url in urls:
            validate_url(url)
        seen_paths.add(path)
        previous_path = path
    return data


def load_manifest(path: Path, *, allow_null: bool = False) -> dict[str, Any] | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ReleaseError(f"could not read release manifest: {exc}") from exc
    if data is None and allow_null:
        return None
    return validate_manifest(data)


def _read_json_response(response: Any, label: str) -> Any:
    status = getattr(response, "status", None)
    if not isinstance(status, int) or not 200 <= status < 300:
        raise ReleaseError(
            f"{label} returned HTTP {status}",
            status_code=status if isinstance(status, int) else None,
        )
    try:
        body = response.read(MAX_RESPONSE_BYTES + 1)
        if len(body) > MAX_RESPONSE_BYTES:
            raise ReleaseError(f"{label} response exceeded the size limit")
        return json.loads(body.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise ReleaseError(f"{label} returned malformed JSON") from exc


def fetch_json(url: str, *, timeout: float = 20.0) -> Any:
    request = Request(
        url,
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
    )
    try:
        with _open_no_redirect(request, timeout=timeout) as response:
            return _read_json_response(response, "release manifest")
    except HTTPError as exc:
        raise ReleaseError(
            f"release manifest returned HTTP {exc.code}",
            status_code=exc.code,
        ) from exc
    except URLError as exc:
        raise ReleaseError("release manifest request failed") from exc


def fetch_live_manifest(
    url: str,
    expected_sha: str,
    *,
    attempts: int,
    delay: float,
) -> dict[str, Any]:
    parsed = urlsplit(url)
    if (
        parsed.scheme != "https"
        or parsed.netloc != "comphy-lab.org"
        or parsed.path != MANIFEST_PATH
        or parsed.query
        or parsed.fragment
    ):
        raise ReleaseError("live manifest endpoint is invalid")
    cache_busted = urlunsplit(parsed._replace(query=urlencode({"release": expected_sha})))
    last_error: ReleaseError | None = None
    for attempt in range(attempts):
        try:
            return validate_manifest(fetch_json(cache_busted), expected_sha)
        except ReleaseError as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(delay)
    assert last_error is not None
    raise last_error


def urls_to_purge(
    previous: dict[str, Any] | None,
    current: dict[str, Any],
) -> list[str]:
    current_files = {entry["path"]: entry for entry in current["files"]}
    purge_urls = set(current["manifest_urls"])
    if previous is None:
        for entry in current_files.values():
            purge_urls.update(entry["urls"])
    else:
        previous_files = {entry["path"]: entry for entry in previous["files"]}
        for path in sorted(set(previous_files) | set(current_files)):
            old = previous_files.get(path)
            new = current_files.get(path)
            if old is None or new is None or old["sha256"] != new["sha256"]:
                if old is not None:
                    purge_urls.update(old["urls"])
                if new is not None:
                    purge_urls.update(new["urls"])
    return sorted(validate_url(url) for url in purge_urls)


def purge_batch(
    urls: list[str],
    *,
    zone_id: str,
    api_token: str,
    timeout: float = 20.0,
) -> str:
    if (
        not urls
        or len(urls) > MAX_PURGE_URLS
        or urls != sorted(set(urls))
    ):
        raise ReleaseError("purge batch size is invalid")
    for url in urls:
        validate_url(url)
    validate_credentials(zone_id, api_token)
    endpoint = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache"
    request = Request(
        endpoint,
        data=json.dumps({"files": urls}, separators=(",", ":")).encode("utf-8"),
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        },
        method="POST",
    )
    try:
        with _open_no_redirect(request, timeout=timeout) as response:
            data = _read_json_response(response, "Cloudflare purge")
    except HTTPError as exc:
        raise ReleaseError(
            f"Cloudflare purge returned HTTP {exc.code}",
            status_code=exc.code,
        ) from exc
    except URLError as exc:
        raise ReleaseError("Cloudflare purge request failed") from exc
    if (
        not isinstance(data, dict)
        or data.get("success") is not True
        or data.get("errors") != []
        or not isinstance(data.get("result"), dict)
        or not isinstance(data["result"].get("id"), str)
        or not ZONE_RE.fullmatch(data["result"]["id"])
    ):
        raise ReleaseError("Cloudflare purge response did not confirm success")
    return data["result"]["id"]


def purge_batch_with_retry(
    urls: list[str],
    *,
    zone_id: str,
    api_token: str,
    max_attempts: int = 3,
    backoff_seconds: tuple[float, ...] = (2.0, 4.0),
) -> str:
    if max_attempts < 1 or len(backoff_seconds) < max_attempts - 1:
        raise ReleaseError("purge retry configuration is invalid")
    for attempt in range(max_attempts):
        try:
            return purge_batch(urls, zone_id=zone_id, api_token=api_token)
        except ReleaseError as exc:
            if exc.status_code != 429 or attempt + 1 >= max_attempts:
                raise
            time.sleep(backoff_seconds[attempt])
    raise AssertionError("purge retry loop did not return or raise")


def purge_release(args: argparse.Namespace) -> None:
    expected_sha = args.expected_sha
    if not SHA_RE.fullmatch(expected_sha):
        raise ReleaseError("expected Git SHA is invalid")
    zone_id = os.environ.get("CLOUDFLARE_ZONE_ID", "")
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN", "")
    try:
        validate_credentials(zone_id, api_token)
    except ReleaseError as exc:
        raise ReleaseError("Cloudflare credentials are missing or invalid") from exc

    previous = load_manifest(args.previous_manifest, allow_null=True)
    current = fetch_live_manifest(
        args.live_manifest_url,
        expected_sha,
        attempts=args.live_attempts,
        delay=args.live_delay,
    )
    urls = urls_to_purge(previous, current)
    receipt_ids: list[str] = []
    for offset in range(0, len(urls), MAX_PURGE_URLS):
        receipt_ids.append(
            purge_batch_with_retry(
                urls[offset : offset + MAX_PURGE_URLS],
                zone_id=zone_id,
                api_token=api_token,
            )
        )
    verify_canonical_manifest(
        args.live_manifest_url,
        expected_sha,
        attempts=min(args.live_attempts, 10),
        delay=min(args.live_delay, 2.0),
    )
    check_public_root()
    print(
        json.dumps(
            {
                "git_sha": expected_sha,
                "purged_url_count": len(urls),
                "cloudflare_receipt_ids": receipt_ids,
                "canonical_manifest_verified": True,
            },
            sort_keys=True,
        )
    )


def verify_canonical_manifest(
    url: str,
    expected_sha: str,
    *,
    attempts: int,
    delay: float,
) -> None:
    last_error: ReleaseError | None = None
    for attempt in range(attempts):
        try:
            validate_manifest(fetch_json(url), expected_sha)
            return
        except ReleaseError as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(delay)
    assert last_error is not None
    raise last_error


def check_public_root(*, timeout: float = 20.0) -> None:
    request = Request(
        ORIGIN + "/",
        headers={"Accept": "text/html", "User-Agent": USER_AGENT},
    )
    try:
        with _open_no_redirect(request, timeout=timeout) as response:
            status = getattr(response, "status", None)
            body = response.read(MAX_RESPONSE_BYTES + 1)
    except HTTPError as exc:
        raise ReleaseError(
            f"website root returned HTTP {exc.code}",
            status_code=exc.code,
        ) from exc
    except URLError as exc:
        raise ReleaseError("website root request failed") from exc
    if status != 200 or not body or len(body) > MAX_RESPONSE_BYTES:
        raise ReleaseError("website root transport check failed")


def capture_manifest(args: argparse.Namespace) -> None:
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,128}", args.cache_key):
        raise ReleaseError("capture cache key is invalid")
    parsed = urlsplit(args.url)
    if (
        parsed.scheme != "https"
        or parsed.netloc != "comphy-lab.org"
        or parsed.path != MANIFEST_PATH
        or parsed.query
        or parsed.fragment
    ):
        raise ReleaseError("capture manifest endpoint is invalid")
    cache_busted = urlunsplit(parsed._replace(query=urlencode({"before": args.cache_key})))
    try:
        data = fetch_json(cache_busted)
    except ReleaseError as exc:
        if exc.status_code != 404:
            raise
        data = None
    if data is not None:
        validate_manifest(data)
    args.output.write_text(json.dumps(data, sort_keys=True) + "\n", encoding="utf-8")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    capture = subparsers.add_parser("capture", help="capture the deployed manifest")
    capture.add_argument("--url", default=ORIGIN + MANIFEST_PATH)
    capture.add_argument("--cache-key", required=True)
    capture.add_argument("--output", type=Path, required=True)
    capture.set_defaults(func=capture_manifest)

    purge = subparsers.add_parser("purge", help="verify and purge a release")
    purge.add_argument("--expected-sha", required=True)
    purge.add_argument("--previous-manifest", type=Path, required=True)
    purge.add_argument("--live-manifest-url", default=ORIGIN + MANIFEST_PATH)
    purge.add_argument("--live-attempts", type=int, default=30)
    purge.add_argument("--live-delay", type=float, default=10.0)
    purge.set_defaults(func=purge_release)
    args = parser.parse_args(argv)
    if getattr(args, "live_attempts", 1) < 1 or getattr(args, "live_delay", 0) < 0:
        parser.error("live attempts must be at least 1; delay must be non-negative")
    return args


def main(argv: list[str] | None = None) -> int:
    try:
        args = parse_args(argv if argv is not None else sys.argv[1:])
        args.func(args)
    except ReleaseError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
