#!/usr/bin/env python3
"""Assemble _research/index.md from chunk files on this branch."""
from pathlib import Path
chunks_dir = Path("_tmp/research-index-chunks")
out = Path("_research/index.md")
parts = [chunks_dir.joinpath(f"{i}.md").read_text(encoding="utf-8") for i in range(5)]
out.write_text("".join(parts), encoding="utf-8")
print(f"Wrote {out} ({out.stat().st_size} bytes)")
