#!/usr/bin/env python3
"""
Convert a reference image (logo / illustration) into a compact grid module
that the particle field can sample particles from.

Usage:
    python3 scripts/reference-to-grid.py <image.png> [output.js] [grid-size]

Output (default src/content/reference.js):
    GRID_W / GRID_H   cell grid dimensions (aspect preserved)
    GRID_BASE64       base64 of the packed 4-bit-per-cell colour-index grid,
                      0 = background, 1..15 = index into GRID_PALETTE
    GRID_PALETTE      the quantised figure colours, as #rrggbb strings

The point sampler in shapes.js decodes this and drops particles on the drawn
cells, so the field reproduces the reference 1:1 rather than approximating it.
"""

import base64
import sys

import numpy as np
from PIL import Image

GRID_MAX = 256
PALETTE_MAX = 15


def load_foreground(path):
    im = Image.open(path)
    im.seek(0)
    rgba = np.array(im.convert("RGBA"), dtype=np.uint8)
    alpha = rgba[:, :, 3]

    if alpha.min() < 200:
        mask = alpha >= 128
    else:
        # No real transparency: guess the background from the border and treat
        # everything that differs from it as drawn.
        border = np.concatenate(
            [rgba[0, :, :3], rgba[-1, :, :3], rgba[:, 0, :3], rgba[:, -1, :3]]
        )
        bg = np.median(border, axis=0)
        mask = np.abs(rgba[:, :, :3].astype(int) - bg.astype(int)).max(axis=2) > 24

    if not mask.any():
        raise SystemExit("no foreground pixels found")

    rows = np.where(mask.any(axis=1))[0]
    cols = np.where(mask.any(axis=0))[0]
    y0, y1 = rows[0], rows[-1] + 1
    x0, x1 = cols[0], cols[-1] + 1

    crop = rgba[y0:y1, x0:x1]
    cmask = mask[y0:y1, x0:x1]
    return crop, cmask


def build_grid(crop, cmask, grid_max=GRID_MAX):
    h, w = cmask.shape
    scale = grid_max / max(h, w)
    gh = max(1, round(h * scale))
    gw = max(1, round(w * scale))

    alpha = np.where(cmask, crop[:, :, 3].astype(float) / 255.0, 0.0)

    # Palette from the drawn pixels only, so background colours never get a slot.
    drawn = crop[cmask][:, :3].reshape(-1, 1, 3).astype(np.uint8)
    quant = Image.fromarray(drawn, "RGB").quantize(PALETTE_MAX)
    pal = np.array(quant.getpalette()[: PALETTE_MAX * 3], dtype=np.uint8).reshape(-1, 3)
    pal = pal[: PALETTE_MAX]

    indices = np.array(quant).reshape(-1)  # index per drawn pixel, same order

    # Spread them back onto a full image of indices, so the fold below can ask
    # "which palette does this pixel use?" per pixel rather than per drawn run.
    index_img = np.full(crop.shape[:2], -1, dtype=int)
    index_img[cmask] = indices

    # Fold the per-pixel indices down onto the grid, taking each cell's mode.
    yy, xx = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
    cell_y = np.clip(yy * gh // h, 0, gh - 1)
    cell_x = np.clip(xx * gw // w, 0, gw - 1)
    counts = np.zeros((gh, gw, PALETTE_MAX + 1), dtype=np.int32)
    for palette_i in range(PALETTE_MAX):
        sel = index_img == palette_i
        np.add.at(counts, (cell_y[sel], cell_x[sel], palette_i + 1), 1)

    grid = counts.argmax(axis=-1).astype(np.uint8)
    return grid, [tuple(int(v) for v in c) for c in pal]


def pack_base64(grid):
    gh, gw = grid.shape
    flat = grid.reshape(-1)
    if flat.size % 2:
        flat = np.append(flat, 0)
    packed = (flat[0::2] << 4) | flat[1::2]
    return base64.b64encode(packed.tobytes()).decode("ascii")


def write_module(path, grid, palette, source):
    gh, gw = grid.shape
    b64 = pack_base64(grid)
    colours = ",\n  ".join(
        '"#%02x%02x%02x"' % c for c in palette
    )
    body = f"""/**
 * Reference grid — generated from {source} by scripts/reference-to-grid.py.
 * Do not edit by hand; regenerate from the image instead.
 *
 * A {gw}x{gh} cell grid, two cells per byte, four bits per cell. A zero cell is
 * background; every other value indexes GRID_PALETTE. shapes.js decodes this
 * and drops one particle per drawn cell, so the field reproduces the reference
 * directly instead of approximating it by hand.
 */
export const GRID_W = {gw}
export const GRID_H = {gh}
export const GRID_PALETTE = [
  {colours},
]
export const GRID_BASE64 =
  "{b64}"
"""
    with open(path, "w") as f:
        f.write(body)
    return len(body)


def render_preview(grid, palette, out):
    gh, gw = grid.shape
    img = np.zeros((gh, gw, 4), dtype=np.uint8)
    for i, c in enumerate(palette):
        img[grid == i + 1] = (*c, 255)
    Image.fromarray(img, "RGBA").save(out)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    source = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else "src/content/reference.js"
    grid_max = int(sys.argv[3]) if len(sys.argv) > 3 else GRID_MAX

    crop, cmask = load_foreground(source)
    grid, palette = build_grid(crop, cmask, grid_max)
    size = write_module(out_path, grid, palette, source)
    render_preview(grid, palette, "/tmp/opencode/grid-render.png")

    drawn = int((grid > 0).sum())
    print(
        f"grid {grid.shape[1]}x{grid.shape[0]}, "
        f"{drawn} drawn cells ({drawn / grid.size:.0%}), "
        f"{len(palette)} colours, module {size / 1024:.1f} kB -> {out_path}"
    )


if __name__ == "__main__":
    main()
