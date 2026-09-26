/**
 * Shapes — the seven figures the field holds as you scroll.
 *
 * Every generator returns a Float32Array of `count * 3` positions in camera
 * space, so all seven share one particle budget and can be interpolated
 * one-to-one. Nothing here is a loaded asset: each figure is drawn from maths,
 * which keeps the whole thing under a couple of kilobytes.
 */

import { projects } from '../content/projects'
import { skillDomains } from '../content/skills'

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

/* Fig 02 — a helix of records: a double spiral standing in for the raw
   datasets the analysis work starts from. */
function recordHelix(count) {
  const out = new Float32Array(count * 3)
  const turns = 3.4
  for (let i = 0; i < count; i++) {
    const t = i / count
    const a = t * Math.PI * 2 * turns
    const strand = rand(i, 31) < 0.5 ? 0 : Math.PI
    const y = 0.72 - t * 1.44
    /* A thick tube, so the strand reads as a band rather than a wire. */
    const r = 0.36 + gauss(i, 32) * 0.14
    out[i * 3] = Math.cos(a + strand) * r
    out[i * 3 + 1] = y + gauss(i, 33) * 0.05
    out[i * 3 + 2] = Math.sin(a + strand) * r
  }
  return out
}

/* Fig 03 — the projects, as a scatter of clusters. One cluster per project. */
function projectScatter(count) {
  const out = new Float32Array(count * 3)
  const centers = projects.map((_, i) => [
    ((i + 0.5) / projects.length - 0.5) * 1.7,
    (i % 2 === 0 ? 0.3 : -0.3) + (i === 0 ? 0.12 : 0),
  ])
  for (let i = 0; i < count; i++) {
    const c = centers[i % centers.length]
    out[i * 3] = c[0] + gauss(i, 41) * 0.13
    out[i * 3 + 1] = c[1] + gauss(i, 42) * 0.2
    out[i * 3 + 2] = gauss(i, 43) * 0.08
  }
  return out
}

/* Fig 04 — four capability bars, one per skill domain, each as tall as the
   number of tools it holds. */
function capabilityBars(count) {
  const out = new Float32Array(count * 3)
  const total = skillDomains.reduce((sum, d) => sum + d.tools.length, 0)
  const bars = skillDomains.map((d, i) => ({
    x: ((i + 1) / (skillDomains.length + 1) - 0.5) * 1.75,
    w: 0.16,
    h: (d.tools.length / total) * 1.5,
  }))
  for (let i = 0; i < count; i++) {
    const b = bars[i % bars.length]
    /* Fill from the baseline up, with a soft jitter along the top edge. */
    const v = rand(i, 51)
    out[i * 3] = b.x + (rand(i, 52) * 2 - 1) * b.w * 0.5
    out[i * 3 + 1] = -0.75 + v * b.h
    out[i * 3 + 2] = gauss(i, 53) * 0.05
  }
  return out
}

/* Fig 05 — a convergence funnel, for contact: many points narrowing to one. */
function funnel(count) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    /* Most points sit in the wide mouth, a few survive to the spout. */
    const biased = Math.pow(t, 2.2)
    const angle = rand(i, 61) * Math.PI * 2
    const r = 0.68 * (1 - biased) + 0.03
    out[i * 3] = Math.cos(angle) * r
    out[i * 3 + 1] = 0.75 - biased * 1.5
    out[i * 3 + 2] = Math.sin(angle) * r * 0.5
  }
  return out
}

/* Fig 06 — a timeline: points strung along a line, gathering at the nodes. */
function timeline(count) {
  const out = new Float32Array(count * 3)
  const nodes = projects.map((_, i) => ((i + 0.5) / projects.length - 0.5) * 1.7)
  for (let i = 0; i < count; i++) {
    const t = rand(i, 71)
    const x = -0.85 + t * 1.7
    const near = nodes.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a))
    const onNode = rand(i, 72) < 0.34
    out[i * 3] = onNode ? near + (rand(i, 73) * 2 - 1) * 0.06 : x
    /* Nodes are tall marks; the rail between them is a thin band. */
    out[i * 3 + 1] = onNode
      ? (rand(i, 74) * 2 - 1) * 0.26
      : (rand(i, 75) * 2 - 1) * 0.035
    out[i * 3 + 2] = gauss(i, 76) * 0.06
  }
  return out
}

export const SHAPES = [
  { id: 'sphere', label: 'Sphere', build: sphere },
  { id: 'figure', label: 'Data figure', build: dataFigure },
  { id: 'helix', label: 'Record helix', build: recordHelix },
  { id: 'scatter', label: 'Project scatter', build: projectScatter },
  { id: 'bars', label: 'Capability bars', build: capabilityBars },
  { id: 'funnel', label: 'Funnel', build: funnel },
  { id: 'timeline', label: 'Timeline', build: timeline },
]
