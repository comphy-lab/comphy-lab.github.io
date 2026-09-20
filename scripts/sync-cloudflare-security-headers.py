#!/usr/bin/env python3
"""Sync the named Cloudflare response-header rule from security/response-headers.json.

Reads CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN from the environment, GETs the
zone entrypoint ruleset for http_response_headers_transform, updates the existing
public_website_browser_security rule in place (sibling rules preserved), and PUTs
the full ruleset back. Exits non-zero on credential or API failure.
"""

from __future__ import annotations

import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request

ROOT = Path(__file__).resolve().parent.parent
PHASE = "http_response_headers_transform"
RULE_REF = "public_website_browser_security"
RULE_DESCRIPTION_PREFIX = "Public website browser security"
API_BASE = "https://api.cloudflare.com/client/v4"


class SyncError(RuntimeError):
    """Cloudflare header sync failed closed."""

    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


def _load(name: str, relative: str):
    path = ROOT / relative
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise SyncError(f"could not load {relative}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


purge = _load("purge_website_cache", "scripts/purge-website-cache.py")
security = _load("browser_security", "scripts/browser-security.py")


def _entrypoint_url(zone_id: str) -> str:
    return f"{API_BASE}/zones/{zone_id}/rulesets/phases/{PHASE}/entrypoint"


def _request_json(
    method: str,
    url: str,
    *,
    api_token: str,
    payload: dict[str, Any] | None = None,
    timeout: float = 30.0,
) -> dict[str, Any]:
    body = None
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {api_token}",
        "User-Agent": purge.USER_AGENT,
    }
    if payload is not None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = Request(url, data=body, headers=headers, method=method)
    try:
        with purge._open_no_redirect(request, timeout=timeout) as response:
            data = purge._read_json_response(response, "Cloudflare ruleset")
    except HTTPError as exc:
        raise SyncError(
            f"Cloudflare ruleset returned HTTP {exc.code}",
            status_code=exc.code,
        ) from exc
    except URLError as exc:
        raise SyncError("Cloudflare ruleset request failed") from exc
    except purge.ReleaseError as exc:
        raise SyncError(str(exc), status_code=exc.status_code) from exc
    if (
        not isinstance(data, dict)
        or data.get("success") is not True
        or data.get("errors") != []
        or not isinstance(data.get("result"), dict)
    ):
        raise SyncError("Cloudflare ruleset response did not confirm success")
    return data["result"]


def is_browser_security_rule(rule: dict[str, Any]) -> bool:
    if not isinstance(rule, dict):
        return False
    if rule.get("ref") == RULE_REF:
        return True
    description = rule.get("description")
    return isinstance(description, str) and description.startswith(
        RULE_DESCRIPTION_PREFIX
    )


def writable_rule(rule: dict[str, Any]) -> dict[str, Any]:
    """Keep only fields the Rulesets API accepts on PUT."""
    if not isinstance(rule, dict):
        raise SyncError("ruleset contains a malformed rule")
    out: dict[str, Any] = {
        "action": rule["action"],
        "expression": rule["expression"],
    }
    if "id" in rule:
        out["id"] = rule["id"]
    if "ref" in rule:
        out["ref"] = rule["ref"]
    if "description" in rule:
        out["description"] = rule["description"]
    if "enabled" in rule:
        out["enabled"] = rule["enabled"]
    if "action_parameters" in rule:
        out["action_parameters"] = rule["action_parameters"]
    return out


def merge_rules(
    existing_rules: list[Any], desired: dict[str, Any]
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not isinstance(existing_rules, list) or not existing_rules:
        raise SyncError("entrypoint ruleset has no rules to update")
    matches = [
        index
        for index, rule in enumerate(existing_rules)
        if isinstance(rule, dict) and is_browser_security_rule(rule)
    ]
    if len(matches) != 1:
        raise SyncError(
            "expected exactly one public_website_browser_security rule; "
            f"found {len(matches)}"
        )
    index = matches[0]
    current = existing_rules[index]
    if not isinstance(current.get("id"), str) or not current["id"]:
        raise SyncError("matched browser-security rule is missing an id")
    updated = dict(desired)
    updated["id"] = current["id"]
    merged: list[dict[str, Any]] = []
    for position, rule in enumerate(existing_rules):
        if position == index:
            merged.append(writable_rule(updated))
        else:
            merged.append(writable_rule(rule))
    return merged, updated


def csp_contains_fonts_googleapis(rule: dict[str, Any]) -> bool:
    headers = (
        rule.get("action_parameters", {}).get("headers", {})
        if isinstance(rule.get("action_parameters"), dict)
        else {}
    )
    if not isinstance(headers, dict):
        return False
    for name in (
        "content-security-policy",
        "content-security-policy-report-only",
    ):
        entry = headers.get(name)
        if not isinstance(entry, dict):
            continue
        value = entry.get("value")
        if isinstance(value, str) and "fonts.googleapis" in value:
            return True
    return False


def sync(*, report_only: bool = False) -> dict[str, Any]:
    zone_id = os.environ.get("CLOUDFLARE_ZONE_ID", "")
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN", "")
    try:
        purge.validate_credentials(zone_id, api_token)
    except purge.ReleaseError as exc:
        raise SyncError("Cloudflare credentials are missing or invalid") from exc

    desired = security.cloudflare_rule(report_only)
    entrypoint = _request_json(
        "GET", _entrypoint_url(zone_id), api_token=api_token
    )
    rules, applied = merge_rules(entrypoint.get("rules", []), desired)
    updated = _request_json(
        "PUT",
        _entrypoint_url(zone_id),
        api_token=api_token,
        payload={"rules": rules},
    )
    applied_live = None
    for rule in updated.get("rules", []):
        if isinstance(rule, dict) and is_browser_security_rule(rule):
            applied_live = rule
            break
    if applied_live is None:
        raise SyncError("updated ruleset is missing the browser-security rule")
    rule_id = applied_live.get("id") or applied["id"]
    return {
        "rule_id": rule_id,
        "ruleset_id": updated.get("id") or entrypoint.get("id"),
        "csp_contains_fonts_googleapis": csp_contains_fonts_googleapis(
            applied_live
        ),
    }


def main() -> int:
    report_only = "--report-only" in sys.argv[1:]
    try:
        receipt = sync(report_only=report_only)
    except SyncError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
