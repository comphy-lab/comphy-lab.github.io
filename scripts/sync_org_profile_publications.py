#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESEARCH_MD = ROOT / "_research" / "index.md"
PROFILE_README = ROOT / "_org_profile" / "README.md"

START = "<!-- RECENT_PUBLICATIONS_START -->"
END = "<!-- RECENT_PUBLICATIONS_END -->"


def extract_recent_publications(text: str, n: int = 3):
    pattern = re.compile(r"<h3\s+id=\"\d+\">\[\d+\]\s*(.*?)</h3>")
    items = []
    for m in pattern.finditer(text):
        raw = m.group(1)
        clean = re.sub(r"<[^>]+>", "", raw)
        clean = re.sub(r"\s+", " ", clean).strip()
        items.append(clean)
    return items[:n]


def build_block(items):
    lines = [START]
    if not items:
        lines.append("1. See latest publications: https://comphy-lab.org/research")
    else:
        for i, item in enumerate(items, 1):
            lines.append(f"{i}. {item}")
        lines.append("")
        lines.append("[View all publications →](https://comphy-lab.org/research)")
    lines.append(END)
    return "\n".join(lines)


def replace_between_markers(text: str, replacement: str):
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), flags=re.DOTALL)
    if not pattern.search(text):
        raise RuntimeError("README missing publication markers")
    return pattern.sub(replacement, text)


def main():
    items = extract_recent_publications(RESEARCH_MD.read_text())
    block = build_block(items)
    updated = replace_between_markers(PROFILE_README.read_text(), block)
    PROFILE_README.write_text(updated)
    print(f"Updated org profile recent publications with {len(items)} items")


if __name__ == "__main__":
    main()
