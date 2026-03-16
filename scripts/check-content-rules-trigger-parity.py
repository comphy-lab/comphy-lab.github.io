#!/usr/bin/env python3
"""Fail if content-rules workflow triggers drift from the files validated by the script."""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
VALIDATE_SCRIPT = REPO_ROOT / "scripts/validate-content-rules.sh"
WORKFLOW_FILE = REPO_ROOT / ".github/workflows/content-rules-checks.yml"

EXTRA_TRIGGER_PATHS = {
    ".github/workflows/content-rules-checks.yml",
    "scripts/check-content-rules-trigger-parity.py",
    "scripts/validate-content-rules.sh",
}


def extract_validated_paths(text: str) -> set[str]:
    pattern = re.compile(r'^\w+_FILE="\$REPO_ROOT/([^"]+)"$', re.MULTILINE)
    return {match.group(1) for match in pattern.finditer(text)}


def extract_event_paths(lines: list[str], event_name: str) -> list[str]:
    paths: list[str] = []
    in_on = False
    current_event = None
    in_paths = False
    on_indent = event_indent = paths_indent = -1

    for raw_line in lines:
        line = raw_line.rstrip("\n")
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        indent = len(line) - len(line.lstrip(" "))

        if not in_on:
            if stripped == "on:":
                in_on = True
                on_indent = indent
            continue

        if indent <= on_indent and stripped.endswith(":"):
            break

        if indent == on_indent + 2 and stripped == f"{event_name}:":
            current_event = event_name
            event_indent = indent
            in_paths = False
            continue

        if current_event != event_name:
            continue

        if indent <= event_indent and stripped.endswith(":") and stripped != f"{event_name}:":
            current_event = None
            in_paths = False
            continue

        if indent == event_indent + 2 and stripped == "paths:":
            in_paths = True
            paths_indent = indent
            continue

        if in_paths:
            if indent <= paths_indent:
                break
            if stripped.startswith("- "):
                value = stripped[2:].strip().strip('"').strip("'")
                paths.append(value)

    return paths


def report(label: str, values: set[str]) -> None:
    print(f"{label} ({len(values)}):")
    for value in sorted(values):
        print(f"  - {value}")


validate_text = VALIDATE_SCRIPT.read_text()
workflow_lines = WORKFLOW_FILE.read_text().splitlines()

validated_paths = extract_validated_paths(validate_text)
pull_request_paths = set(extract_event_paths(workflow_lines, "pull_request"))
push_paths = set(extract_event_paths(workflow_lines, "push"))

errors: list[str] = []

if not validated_paths:
    errors.append("Could not extract any $REPO_ROOT-backed validated files from scripts/validate-content-rules.sh")

if not pull_request_paths:
    errors.append("Could not extract pull_request.paths from .github/workflows/content-rules-checks.yml")

if not push_paths:
    errors.append("Could not extract push.paths from .github/workflows/content-rules-checks.yml")

missing_in_pr = validated_paths - pull_request_paths
missing_in_push = validated_paths - push_paths
unexpected_pr = pull_request_paths - validated_paths - EXTRA_TRIGGER_PATHS
unexpected_push = push_paths - validated_paths - EXTRA_TRIGGER_PATHS

if missing_in_pr:
    errors.append("pull_request.paths is missing validated files")
if missing_in_push:
    errors.append("push.paths is missing validated files")
if unexpected_pr:
    errors.append("pull_request.paths contains repo-file entries outside the validated set and approved extras")
if unexpected_push:
    errors.append("push.paths contains repo-file entries outside the validated set and approved extras")
if pull_request_paths != push_paths:
    errors.append("pull_request.paths and push.paths differ")

if errors:
    print("Content-rules trigger parity check failed.\n")
    for error in errors:
        print(f"- {error}")
    print("")
    report("Validated files", validated_paths)
    report("pull_request.paths", pull_request_paths)
    report("push.paths", push_paths)
    report("Approved extra trigger paths", EXTRA_TRIGGER_PATHS)
    if missing_in_pr:
        report("Missing from pull_request.paths", missing_in_pr)
    if missing_in_push:
        report("Missing from push.paths", missing_in_push)
    if unexpected_pr:
        report("Unexpected pull_request.paths entries", unexpected_pr)
    if unexpected_push:
        report("Unexpected push.paths entries", unexpected_push)
    sys.exit(1)

print("✓ Content-rules workflow triggers match the validated-file set (plus approved self-check extras).")
