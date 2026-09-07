#!/usr/bin/env python3
"""Build a deterministic, SHA-bound manifest of purge-owned site output."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import quote


ORIGIN = "https://comphy-lab.org"
MANIFEST_NAME = "release-manifest.json"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
HASH_CHUNK_BYTES = 1024 * 1024


def load_purge_module() -> Any:
    path = Path(__file__).with_name("purge-website-cache.py")
    spec = importlib.util.spec_from_file_location("purge_website_cache", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load purge policy")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


PURGE = load_purge_module()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(HASH_CHUNK_BYTES):
            digest.update(chunk)
    return digest.hexdigest()


def output_urls(relative_path: str) -> list[str]:
    encoded = "/".join(quote(part, safe="-._~") for part in relative_path.split("/"))
    path = "/" + encoded
    aliases = {path}
    if relative_path == "index.html":
        aliases.add("/")
    elif relative_path.endswith("/index.html"):
        directory = path[: -len("index.html")]
        aliases.update({directory, directory.rstrip("/")})
    elif relative_path.endswith(".html") and not relative_path.endswith("404.html"):
        extensionless = path[: -len(".html")]
        aliases.update({extensionless, extensionless + "/"})
    return sorted(ORIGIN + alias for alias in aliases if PURGE.is_owned_path(alias))


def build_manifest(site_dir: Path, git_sha: str) -> dict[str, Any]:
    if not SHA_RE.fullmatch(git_sha):
        raise ValueError("Git SHA must be exactly 40 lowercase hexadecimal characters")
    if not site_dir.is_dir() or site_dir.is_symlink():
        raise ValueError("site directory must be a real directory")

    entries: list[dict[str, Any]] = []
    for path in sorted(site_dir.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"site output contains a symbolic link: {path}")
        if not path.is_file():
            continue
        relative = path.relative_to(site_dir).as_posix()
        pure = PurePosixPath(relative)
        if relative == MANIFEST_NAME:
            continue
        if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
            raise ValueError(f"site output path is unsafe: {relative}")
        urls = output_urls(relative)
        if not urls:
            continue
        entries.append(
            {
                "path": relative,
                "sha256": sha256_file(path),
                "urls": urls,
            }
        )

    entries.sort(key=lambda entry: entry["path"])

    manifest = {
        "schema_version": PURGE.SCHEMA_VERSION,
        "git_sha": git_sha,
        "manifest_urls": [ORIGIN + "/" + MANIFEST_NAME],
        "files": entries,
    }
    PURGE.validate_manifest(manifest, git_sha)
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", type=Path, default=Path("_site"))
    parser.add_argument("--git-sha", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    manifest = build_manifest(args.site_dir, args.git_sha)
    args.output.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
