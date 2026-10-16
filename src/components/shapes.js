/**
 * Shapes — the seven figures the field holds as you scroll.
 *
 * Every generator returns a Float32Array of `count * 3` positions in camera
 * space, so all seven share one particle budget and can be interpolated
 * one-to-one. Nothing here is a loaded asset: each figure is drawn from maths,
 * which keeps the whole thing under a couple of kilobytes.
 */

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
  return out
}

/* Fig 00 — a hollow sphere, the field at rest. */
function sphere(count) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const u = rand(i, 1) * 2 - 1
    const theta = rand(i, 2) * Math.PI * 2
    const r = Math.sqrt(1 - u * u)
    /* Bias slightly towards the surface so it reads as a shell, not a blob. */
    const shell = 0.72 + rand(i, 3) * 0.28
    out[i * 3] = r * Math.cos(theta) * shell
    out[i * 3 + 1] = r * Math.sin(theta) * shell * 0.96
    out[i * 3 + 2] = u * shell
  }
  return out
}

/* Fig 01 — a person drawn from measurements, for "How I work".
   A head, shoulders and torso, with the interior left as a scatter rather
   than a solid fill, so it reads as plotted data. */
function dataFigure(count) {
  const out = new Float32Array(count * 3)
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
  }
  return out
}

/* Fig 02 — a Lissajous figure for "selected work".
   Two oscillations at a 3:2 ratio with a quarter-phase offset: the curve is a
   figure that only exists once plotted, which is what this section's label
   claims it is, and it never repeats into a blob the way a filled shape does.

   The curve is traced as a bundle of strands rather than a single wire — each
   strand offset slightly in phase, so the ribbon reads as several threads laid
   down together. That is the argument: separate strands, one figure. Which
   fits a portfolio of separate projects resolving into one body of work.

   The scatter around each strand is deliberate. This budget is 14,000 points
   and the material blends additively, so a tight curve would stack particles
   into a blown-out white core while the lobe ends stay dark. Spreading each
   point across the ribbon thins the overlap, so the figure carries an even
   weight and stays legible as a curve rather than a glowing rope. */
function lissajous(count) {
  const out = new Float32Array(count * 3)
  const STRANDS = 5
  const PER_STRAND = count / STRANDS
  for (let i = 0; i < count; i++) {
    const strand = i % STRANDS
    const step = Math.floor(i / STRANDS)
    /* Phase advances fastest across strands and slowest along the curve, so
       consecutive particles never land on the same point. Each strand walks the
       full 2π, which closes the figure. */
    const t = (step / PER_STRAND) * Math.PI * 2 + strand * 0.022
    const phase = Math.PI / 2 + strand * 0.035
    out[i * 3] = Math.sin(3 * t + phase) * 0.82 + gauss(i, 41) * 0.05
    out[i * 3 + 1] = Math.sin(2 * t) * 0.72 + gauss(i, 42) * 0.05
    out[i * 3 + 2] = gauss(i, 43) * 0.08
  }
  return out
}

/* Fig 04 — a specimen lattice, for "the toolkit". A halftone-style grid of
   dense dots with clear gaps between them: no hierarchy and no bars, the sheet
   reads the same from any side, which is what a flat list of names argues too.
   Each node is a tight cluster so the 14k particle budget spends itself inside
   the dots rather than filling the square between them. */
function specimenGrid(count) {
  const out = new Float32Array(count * 3)
  const NODES = 16
  for (let i = 0; i < count; i++) {
    const node = i % (NODES * NODES)
    const gx = node % NODES
    const gy = Math.floor(node / NODES)
    out[i * 3] = ((gx + 0.5) / NODES - 0.5) * 1.1 + gauss(i, 51) * 0.016
    out[i * 3 + 1] = ((gy + 0.5) / NODES - 0.5) * 1.1 + gauss(i, 52) * 0.016
    out[i * 3 + 2] = gauss(i, 53) * 0.03
  }
  return out
}

/* Fig 04 — an outgoing signal, for contact. Concentric rings radiating from a
   single origin: one point of contact, sending outward. A funnel narrowed
   everything to a point, which read as a cone and argued the opposite of what
   the section says. */
function signal(count) {
  const out = new Float32Array(count * 3)
  const RINGS = 7
  for (let i = 0; i < count; i++) {
    /* Most points sit on the rings; a few fill the core, which reads as the
       origin rather than a hole. */
    const onRing = rand(i, 61) < 0.86
    let x
    let y

    if (onRing) {
      /* Pick a ring, then a point around it. */
      const ring = Math.floor(rand(i, 62) * RINGS)
      const radius = 0.12 + (ring / (RINGS - 1)) * 0.72
      const angle = rand(i, 63) * Math.PI * 2
      /* A little thickness so a ring is a band, not a wire. */
      const thickness = gauss(i, 64) * 0.012
      x = Math.cos(angle) * (radius + thickness)
      y = Math.sin(angle) * (radius + thickness)
    } else {
      const r = Math.sqrt(rand(i, 65)) * 0.13
      const angle = rand(i, 66) * Math.PI * 2
      x = Math.cos(angle) * r
      y = Math.sin(angle) * r
    }
    out[i * 3] = x
    out[i * 3 + 1] = y
    out[i * 3 + 2] = gauss(i, 67) * 0.05
  }
  return out
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
  { id: 'sphere', label: 'Sphere', anchor: 'hero', at: 0.5, build: sphere },
  { id: 'figure', label: 'Data figure', anchor: 'about', at: 0.45, frame: 0.7, build: dataFigure },
  { id: 'lissajous', label: 'Lissajous figure', anchor: 'work', at: 0.5, frame: 0.7, build: lissajous },
  { id: 'grid', label: 'Specimen grid', anchor: 'skills', at: 0.45, frame: 0.45, build: specimenGrid },
  /* Contact is the last section and the page cannot scroll far enough to
     centre it, so the signal is anchored where the field can still be read in
     full — the run-up to contact, as the reader leaves the toolkit grid. */
  { id: 'signal', label: 'Signal', anchor: 'contact', at: -0.6, frame: 0.7, build: signal },
]
