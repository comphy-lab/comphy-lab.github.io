#!/usr/bin/env python3
"""Write resized WebP siblings and a manifest for local raster images.

Original PNG and JPEG files stay in place. Partner marks (Durham,
Basilisk, Physics of Fluids) are resized with Lanczos and stored as
lossless WebP so brand colours are not requantised. Other images use
lossy WebP at a width cap matched to how the layout displays them.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
MANIFEST_PATH = ASSETS / "image-variants.json"
RASTER = {".png", ".jpg", ".jpeg"}
WIDTHS = (200, 480, 800, 1200)
SKIP_PARTS = {"favicon"}


def is_partner(path: Path) -> bool:
    name = path.name.lower()
    return any(
        key in name for key in ("durham", "basilisk", "logopof", "logo_pof")
    )


def width_cap(path: Path) -> int:
    parts = set(path.parts)
    name = path.name.lower()
    if "logos" in parts:
        if "comphy-lab-no-name" in name:
            return 320
        if is_partner(path):
            return 480
        return 640
    if "team" in parts:
        return 640
    if "news" in parts:
        return 800
    if "covers" in parts or "hero" in name:
        return 1200
    if "teaching" in parts:
        return 1400
    return 960


def variant_widths(original: int, cap: int) -> list[int]:
    limit = min(original, cap)
    widths = [width for width in WIDTHS if width < limit - 8 and width <= cap]
    if not widths or widths[-1] != limit:
        widths.append(limit)
    return sorted(set(widths))


def save_webp(image: Image.Image, dest: Path, partner: bool) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if partner:
        image.save(dest, format="WEBP", lossless=True, method=6)
        return
    image.save(dest, format="WEBP", quality=78, method=6)


def optimise(path: Path) -> dict:
    partner = is_partner(path)
    with Image.open(path) as opened:
        original_w, original_h = opened.size
        image = opened.convert("RGBA" if "A" in opened.getbands() else "RGB")
    widths = variant_widths(original_w, width_cap(path))
    largest = max(widths)
    sources = []
    stem = path.with_suffix("")
    for width in widths:
        height = max(1, round(original_h * (width / original_w)))
        resized = (
            image
            if width == original_w
            else image.resize((width, height), Image.Resampling.LANCZOS)
        )
        # The largest candidate keeps the plain .webp name.
        if width == largest:
            dest = stem.with_suffix(".webp")
        else:
            dest = Path(f"{stem}-{width}.webp")
        save_webp(resized, dest, partner)
        url = "/" + dest.relative_to(ROOT).as_posix()
        sources.append({"src": url, "width": resized.size[0]})
    return {
        "width": original_w,
        "height": original_h,
        "sources": sources,
    }


def main() -> None:
    manifest = {}
    for path in sorted(ASSETS.rglob("*")):
        if path.suffix.lower() not in RASTER or not path.is_file():
            continue
        if SKIP_PARTS.intersection(path.parts):
            continue
        if path.name.endswith(".webp"):
            continue
        url = "/" + path.relative_to(ROOT).as_posix()
        manifest[url] = optimise(path)
        print(f"{url} -> {len(manifest[url]['sources'])} webp")
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Wrote {MANIFEST_PATH} ({len(manifest)} images)")


if __name__ == "__main__":
    main()
