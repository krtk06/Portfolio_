/**
 * Shapes — the figures the field holds as you scroll.
 *
 * Every generator returns a Float32Array of `count * 3` positions in camera
 * space, so all of them share one particle budget and can be interpolated
 * one-to-one. The hero knot and the Projects tree are supplied artwork,
 * embedded as compact colour grids and sampled directly (see
 * ../content/reference*.js and scripts/reference-to-grid.py); the rest are
 * drawn from maths.
 */

import { GRID_W, GRID_H, GRID_PALETTE, GRID_BASE64 } from '../content/reference'
import {
  GRID_W as KNOT_GRID_W,
  GRID_H as KNOT_GRID_H,
  GRID_PALETTE as KNOT_GRID_PALETTE,
  GRID_BASE64 as KNOT_GRID_BASE64,
} from '../content/reference-knot'

/* Deterministic noise so a shape looks the same on every load. The result is
   clamped to [0, 1] — an unclamped hash can go negative, and feeding a
   negative into a fractional power yields NaN, which poisons the geometry. */
const rand = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  const f = x - Math.floor(x)
  return f < 0 ? 0 : f > 1 ? 1 : f
}
const gauss = (i, salt) =>
  (rand(i, salt) + rand(i, salt + 1) + rand(i, salt + 2) - 1.5) / 1.5

/* Interleave three 10-bit coordinates into one 30-bit Morton key, so a position
   collapses to a single number that grows with how far along the space-filling
   Z-curve it sits. Sorting by this key lays a figure out in a locally coherent
   order: neighbours in the array are neighbours in space. */
const morton = (x, y, z) => {
  let key = 0
  for (let b = 0; b < 10; b++) {
    key |= ((x >> b) & 1) << (3 * b)
    key |= ((y >> b) & 1) << (3 * b + 1)
    key |= ((z >> b) & 1) << (3 * b + 2)
  }
  return key
}

/* Reorder a figure along its Morton curve.

   Every shape is reordered the same way, so particle `i` of one figure and
   particle `i` of the next tend to sit in the same region of space. When the
   field interpolates the two, each point travels a short, direct path instead
   of criss-crossing the scene — which is what makes the morph read as one
   body of matter flowing rather than two point clouds swapping places.

   The figure is normalised into its own bounding box before quantising, so a
   wide shape and a tall one still map corner-to-corner onto each other. */
export const orderAlongCurve = (points, count) => {
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (let i = 0; i < count; i++) {
    const x = points[i * 3]
    const y = points[i * 3 + 1]
    const z = points[i * 3 + 2]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  const spanZ = maxZ - minZ || 1
  const MAX = 1023

  const keys = new Float64Array(count)
  const order = new Int32Array(count)
  for (let i = 0; i < count; i++) {
    const qx = Math.round(((points[i * 3] - minX) / spanX) * MAX)
    const qy = Math.round(((points[i * 3 + 1] - minY) / spanY) * MAX)
    const qz = Math.round(((points[i * 3 + 2] - minZ) / spanZ) * MAX)
    keys[i] = morton(qx, qy, qz)
    order[i] = i
  }
  /* Ties broken by index, so the layout is identical on every load. */
  const sorted = Array.from(order).sort((a, b) => keys[a] - keys[b] || a - b)

  const out = new Float32Array(count * 3)
  for (let r = 0; r < count; r++) {
    const i = sorted[r]
    out[r * 3] = points[i * 3]
    out[r * 3 + 1] = points[i * 3 + 1]
    out[r * 3 + 2] = points[i * 3 + 2]
  }
  /* The order is returned too, so a parallel per-particle array — colour, in
     practice — can be permuted the same way and stay attached to its point. */
  return { points: out, order: sorted }
}

/* The supplied artwork is embedded as a 4-bit grid (src/content/reference*.js),
   decoded once, and particles are dropped on its drawn cells. That reproduces
   the source exactly instead of approximating it by hand, which is what the
   earlier generated trees did. A tint replaces the sampled palette, so the
   hero mark can use the brand yellow while Projects keeps the mangrove's own
   colours. */
const makeReferenceShape = ({ width, height, palette, base64, tint }) => {
  let grid = null
  const picksByCount = new Map()

  const source = () => {
    if (grid) return grid
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)

    /* Flat [cellIndex, colourIndex, ...] — drawn cells only. */
    const cells = []
    for (let i = 0; i < width * height; i++) {
      const byte = bytes[i >> 1]
      const value = i & 1 ? byte & 15 : byte >> 4
      if (value) cells.push(i, value - 1)
    }
    const colours = palette.map((hex) => [
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    ])
    grid = { cells, colours }
    return grid
  }

  /* A deterministic sample of the drawn cells. Done once per budget and cached,
     so the same viewport always gets the same figure. */
  const picksFor = (count) => {
    const cached = picksByCount.get(count)
    if (cached) return cached
    const { cells } = source()
    const n = cells.length / 2
    const idx = new Int32Array(n)
    for (let i = 0; i < n; i++) idx[i] = i
    let seed = 0x2545f491
    const rnd = () => {
      seed ^= seed << 13
      seed ^= seed >>> 17
      seed ^= seed << 5
      return (seed >>> 0) / 4294967296
    }
    const take = Math.min(count, n)
    for (let i = 0; i < take; i++) {
      const j = i + Math.floor(rnd() * (n - i))
      const t = idx[i]
      idx[i] = idx[j]
      idx[j] = t
    }
    const picks = idx.slice(0, take)
    picksByCount.set(count, picks)
    return picks
  }

  return (count) => {
    const points = new Float32Array(count * 3)
    const colours = new Float32Array(count * 3)
    const { cells, colours: palette } = source()
    const picks = picksFor(count)
    for (let i = 0; i < count; i++) {
      const pick = picks[i % picks.length]
      const cell = cells[pick * 2]
      const cx = cell % width
      const cy = Math.floor(cell / width)
      /* Jitter inside the cell so the grid never shows through. */
      const jx = (rand(i, 501) - 0.5) * 1.1
      const jy = (rand(i, 502) - 0.5) * 1.1
      points[i * 3] = (cx + 0.5 + jx) / width - 0.5
      points[i * 3 + 1] = 0.5 - (cy + 0.5 + jy) / height
      points[i * 3 + 2] = (rand(i, 503) - 0.5) * 0.02

      if (tint) {
        /* A little brightness variation keeps the mark from reading as a flat
           block of colour once the particles overlap. */
        const glow = 0.82 + rand(i, 504) * 0.18
        colours[i * 3] = tint[0] * glow
        colours[i * 3 + 1] = tint[1] * glow
        colours[i * 3 + 2] = tint[2] * glow
      } else {
        const colour = palette[cells[pick * 2 + 1]]
        colours[i * 3] = colour[0]
        colours[i * 3 + 1] = colour[1]
        colours[i * 3 + 2] = colour[2]
      }
    }
    return { points, colours }
  }
}

/* #fece00 — keep in sync with --brand-yellow in styles/tokens.css. The canvas
   writes colours to a shader buffer, so it cannot read the CSS variable. */
const BRAND_YELLOW = [254 / 255, 206 / 255, 0]

/* Fig 00 — the hero mark: three interlocking ribbons. Tinted brand yellow, the
   one warm accent on an otherwise monochrome page. */
const knotShape = makeReferenceShape({
  width: KNOT_GRID_W,
  height: KNOT_GRID_H,
  palette: KNOT_GRID_PALETTE,
  base64: KNOT_GRID_BASE64,
  tint: BRAND_YELLOW,
})

/* Fig 02 — the supplied mangrove logo, moved from the hero to Projects. It
   keeps its own green/brown palette so it still reads as a drawing rather than
   another field figure. */
const treeShape = makeReferenceShape({
  width: GRID_W,
  height: GRID_H,
  palette: GRID_PALETTE,
  base64: GRID_BASE64,
})

/* Fig 01 — a person drawn from measurements, for "How I work".
   A head, shoulders and torso, with the interior left as a scatter rather
   than a solid fill, so it reads as plotted data. */
function dataFigure(count) {
  const out = new Float32Array(count * 3)
  const colours = new Float32Array(count * 3)
  const headY = 0.66
  const headR = 0.23
  for (let i = 0; i < count; i++) {
    const t = rand(i, 11)
    const angle = rand(i, 12) * Math.PI * 2
    let x
    let y
    let z

    if (t < 0.22) {
      /* Head: a ring plus a sparse interior. */
      const inside = rand(i, 13) < 0.45
      const r = inside ? Math.sqrt(rand(i, 14)) * headR : headR
      const a = inside ? rand(i, 15) * Math.PI * 2 : angle
      x = Math.cos(a) * r
      y = headY + Math.sin(a) * r * 1.12
      z = (inside ? (rand(i, 16) - 0.5) * 0.12 : 0) + gauss(i, 17) * 0.012
    } else if (t < 0.32) {
      /* Neck. */
      x = gauss(i, 18) * 0.05
      y = 0.36 + rand(i, 19) * 0.12
      z = gauss(i, 20) * 0.04
    } else {
      /* Shoulders and torso, drawn as rows of points and denser at the edges.
         Named torsoY rather than y: a `const y` here would shadow the outer
         accumulator, leaving it undefined and landing in the buffer as NaN. */
      const v = (t - 0.32) / 0.68
      const torsoY = 0.34 - v * 1.05
      const width = 0.3 + Math.pow(Math.max(v, 0), 0.6) * 0.62
      const edge = rand(i, 21) < 0.45
      const u = edge
        ? rand(i, 22) < 0.5
          ? -width + rand(i, 23) * 0.08
          : width - rand(i, 23) * 0.08
        : (rand(i, 24) * 2 - 1) * width
      x = u
      y = torsoY
      z = gauss(i, 25) * 0.06 * (1 - v * 0.4)
      /* Round the shoulders off at the top of the torso. */
      if (v < 0.06) x *= 0.7 + v * 5
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = z

    /* Bronze at the base warming to ivory at the head: a figure measured in
       warm light rather than white noise. */
    const lift = Math.min(Math.max((y + 0.75) / 1.7, 0), 1)
    const glow = 0.86 + rand(i, 26) * 0.14
    colours[i * 3] = (0.8 + 0.17 * lift) * glow
    colours[i * 3 + 1] = (0.52 + 0.4 * lift) * glow
    colours[i * 3 + 2] = (0.28 + 0.56 * lift) * glow
  }
  return { points: out, colours }
}

/* Fig 03 — a specimen lattice, for "the toolkit". A halftone-style grid of
   dense dots with clear gaps between them: no hierarchy and no bars, the sheet
   reads the same from any side, which is what a flat list of names argues too.
   Each node is a tight cluster so the 14k particle budget spends itself inside
   the dots rather than filling the square between them. */
function specimenGrid(count) {
  const out = new Float32Array(count * 3)
  const colours = new Float32Array(count * 3)
  const NODES = 16
  /* A diagonal ramp across the sheet — mint to indigo — so the grid reads as a
     chart with an axis rather than a flat field of dots. */
  const RAMP = [
    [0.35, 0.85, 0.7],
    [0.3, 0.62, 0.95],
    [0.48, 0.38, 0.88],
  ]
  for (let i = 0; i < count; i++) {
    const node = i % (NODES * NODES)
    const gx = node % NODES
    const gy = Math.floor(node / NODES)
    out[i * 3] = ((gx + 0.5) / NODES - 0.5) * 1.1 + gauss(i, 51) * 0.016
    out[i * 3 + 1] = ((gy + 0.5) / NODES - 0.5) * 1.1 + gauss(i, 52) * 0.016
    out[i * 3 + 2] = gauss(i, 53) * 0.03

    const u = (gx + gy) / (2 * (NODES - 1))
    const half = u < 0.5 ? u * 2 : (u - 0.5) * 2
    const from = RAMP[u < 0.5 ? 0 : 1]
    const to = RAMP[u < 0.5 ? 1 : 2]
    const glow = 0.82 + rand(i, 54) * 0.18
    colours[i * 3] = (from[0] + (to[0] - from[0]) * half) * glow
    colours[i * 3 + 1] = (from[1] + (to[1] - from[1]) * half) * glow
    colours[i * 3 + 2] = (from[2] + (to[2] - from[2]) * half) * glow
  }
  return { points: out, colours }
}

/* Fig 04 — an outgoing signal, for contact. Concentric rings radiating from a
   single origin: one point of contact, sending outward. A funnel narrowed
   everything to a point, which read as a cone and argued the opposite of what
   the section says. */
function signal(count) {
  const out = new Float32Array(count * 3)
  const colours = new Float32Array(count * 3)
  const RINGS = 7
  /* Copper at the origin, deepening outward: a signal sent from a warm source.
     Deliberately no rose or pink in the outer rings — that second accent read
     as an odd colour shift rather than part of the same material. */
  const RAMP = [
    [1.0, 0.88, 0.7],
    [0.98, 0.6, 0.28],
    [0.8, 0.36, 0.22],
  ]
  for (let i = 0; i < count; i++) {
    /* Most points sit on the rings; a few fill the core, which reads as the
       origin rather than a hole. */
    const onRing = rand(i, 61) < 0.86
    let x
    let y
    let dist

    if (onRing) {
      /* Pick a ring, then a point around it. */
      const ring = Math.floor(rand(i, 62) * RINGS)
      const radius = 0.12 + (ring / (RINGS - 1)) * 0.72
      const angle = rand(i, 63) * Math.PI * 2
      /* A little thickness so a ring is a band, not a wire. */
      const thickness = gauss(i, 64) * 0.012
      x = Math.cos(angle) * (radius + thickness)
      y = Math.sin(angle) * (radius + thickness)
      dist = radius
    } else {
      const r = Math.sqrt(rand(i, 65)) * 0.13
      const angle = rand(i, 66) * Math.PI * 2
      x = Math.cos(angle) * r
      y = Math.sin(angle) * r
      dist = r
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = gauss(i, 67) * 0.05

    const u = Math.min(dist / 0.9, 1)
    const half = u < 0.5 ? u * 2 : (u - 0.5) * 2
    const from = RAMP[u < 0.5 ? 0 : 1]
    const to = RAMP[u < 0.5 ? 1 : 2]
    const glow = 0.7 + rand(i, 68) * 0.3
    colours[i * 3] = (from[0] + (to[0] - from[0]) * half) * glow
    colours[i * 3 + 1] = (from[1] + (to[1] - from[1]) * half) * glow
    colours[i * 3 + 2] = (from[2] + (to[2] - from[2]) * half) * glow
  }
  return { points: out, colours }
}

/* Order matters: the field walks this list as the reader scrolls, and
   `anchor` is the section each figure belongs to. `at` is how far into that
   section it is fully formed (0 = top edge, 1 = bottom edge). One figure per
   section: a second figure inside a section meant a mid-section morph, which
   is what left shapes half-formed and unreadable.
   `frame` is how much of the camera's height the figure fills — smaller is
   further back. The three figures listed with an explicit frame were the ones
   crowding the right-hand column; the rest keep the default. */
export const SHAPES = [
  {
    id: 'knot',
    label: 'Knot',
    anchor: 'hero',
    at: 0.5,
    /* The mark is nearly square, so it is framed by its width: any larger and
       it spills out of the field's column into the text. */
    frame: 0.78,
    /* A supplied mark needs more air around it than the other field figures;
       this trims it without resizing anything else. */
    size: 0.75,
    /* A supplied drawing must sit square-on and still while it is the resting
       figure; the field's scroll turn and drift are faded out for it. */
    flat: true,
    build: knotShape,
  },
  { id: 'figure', label: 'Data figure', anchor: 'about', at: 0.45, frame: 0.7, build: dataFigure },
  {
    id: 'tree',
    label: 'Tree',
    anchor: 'work',
    at: 0.5,
    frame: 0.78,
    /* Match the hero mark's breathing room so the two supplied drawings read
       at the same scale across the page. */
    size: 0.75,
    flat: true,
    build: treeShape,
  },
  { id: 'grid', label: 'Specimen grid', anchor: 'skills', at: 0.45, frame: 0.45, build: specimenGrid },
  /* Contact is the last section and the page cannot scroll far enough to
     centre it, so the signal is anchored where the field can still be read in
     full — the run-up to contact, as the reader leaves the toolkit grid. */
  { id: 'signal', label: 'Signal', anchor: 'contact', at: -0.6, frame: 0.7, build: signal },
]
