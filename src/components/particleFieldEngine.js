// aislop-ignore-file complexity/file-too-large -- the scene orchestrator owns renderer, geometry, scroll measurement and the frame loop as one lifecycle.
/**
 * The particle field's Three.js scene. Kept out of the React component so the
 * mount lifecycle is a thin wrapper and the scene can be read on its own.
 */
import * as THREE from 'three'
import { SHAPES, orderAlongCurve } from './shapes'
import { VERTEX_SHADER, FRAGMENT_SHADER } from './particleShaders'

const COUNTS = { mobile: 1800, tablet: 7000, desktop: 14000 }

/* Standard ease, so a transition accelerates away and settles in. */
const smoothstep = (t) => {
  const x = Math.min(Math.max(t, 0), 1)
  return x * x * (3 - 2 * x)
}

const scheduleIdle =
  typeof window.requestIdleCallback === 'function'
    ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
    : (fn) => setTimeout(fn, 100)

/* The scene owns renderer, camera, geometry, material, scroll measurement and
   the animation loop as one lifecycle. Extracting helpers would only thread
   the same ~30 mutable values through argument lists, so this stays together. */
// aislop-ignore-next-line complexity/function-too-long -- one render lifecycle shares its mutable state end to end.
export function createParticleField(container) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSmall = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280
  const quality = isSmall ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  const COUNT = COUNTS[quality] || 11000

  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight

  const renderer = new THREE.WebGLRenderer({
    antialias: quality === 'desktop',
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'mobile' ? 1 : 1.5))
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.z = 3.4

  /* Every figure is a point cloud at the same budget, normalised into the
     camera frame — otherwise a shape authored for a wide viewport drifts
     out of a narrow one.
     `frame` is how much of the camera's height a figure fills, and it is
     per figure: a shape that read as too large in the right-hand column can
     be set back without resizing the ones that were already right. */
  const DEFAULT_FRAME = 0.82
  /* The field is a tall, narrow column, so a figure framed by its height
     can be wider than the canvas at tablet widths. Shrinking the whole
     cloud uniformly — rather than squashing its x — keeps a supplied
     drawing centred and undistorted when the column is at its narrowest;
     wide desktop columns leave it at full size. */
  const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
  const fitFor = (i) => {
    /* Read the live aspect here, not once at init: a resize changes the
       column's shape and the figure has to respond on the next frame. */
    const widthLimit = ((visibleHeight * camera.aspect) / 2) * 0.92
    const shape = SHAPES[i]
    const frame = shape.frame ?? DEFAULT_FRAME
    return Math.min(1, widthLimit / frame) * (shape.size ?? 1)
  }
  /* The field's own colour, used by every generated figure. The supplied
     artwork brings its own palette. */
  const WHITE = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    WHITE[i * 3] = 0.8
    WHITE[i * 3 + 1] = 0.82
    WHITE[i * 3 + 2] = 0.86
  }
  const built = new Map()
  const shapeAt = (i) => {
    if (built.has(i)) return built.get(i)
    /* A figure may return positions alone, or positions with a colour per
       particle. Reorder along the Morton curve first, so every figure
       shares one particle order and points travel short paths between
       shapes. */
    const raw = SHAPES[i].build(COUNT)
    const source = raw.points ?? raw
    const ordered = orderAlongCurve(source, COUNT)
    const points = ordered.points
    const frame = SHAPES[i].frame ?? DEFAULT_FRAME
    let maxX = 0
    let maxY = 0
    for (let k = 0; k < COUNT; k++) {
      const ax = Math.abs(points[k * 3])
      const ay = Math.abs(points[k * 3 + 1])
      if (ax > maxX) maxX = ax
      if (ay > maxY) maxY = ay
    }
    const scale = Math.min(frame / (maxX || 1), frame / (maxY || 1))
    for (let k = 0; k < COUNT; k++) {
      points[k * 3] *= scale
      points[k * 3 + 1] *= scale
      points[k * 3 + 2] *= scale
    }
    /* Colours are permuted by the same order, so each point keeps its own
       colour and the pair stays attached through the morph. */
    let colours = WHITE
    if (raw.points) {
      colours = new Float32Array(COUNT * 3)
      for (let r = 0; r < COUNT; r++) {
        const src = ordered.order[r]
        colours[r * 3] = raw.colours[src * 3]
        colours[r * 3 + 1] = raw.colours[src * 3 + 1]
        colours[r * 3 + 2] = raw.colours[src * 3 + 2]
      }
    }
    const entry = { points, colours }
    built.set(i, entry)
    return entry
  }

  const first = shapeAt(0)
  const next = shapeAt(1)
  const geometry = new THREE.BufferGeometry()
  const position = new THREE.BufferAttribute(new Float32Array(first.points), 3)
  geometry.setAttribute('position', position)
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(next.points), 3))
  const colour = new THREE.BufferAttribute(new Float32Array(first.colours), 3)
  const colourTarget = new THREE.BufferAttribute(new Float32Array(next.colours), 3)
  geometry.setAttribute('aColor', colour)
  geometry.setAttribute('aTargetColor', colourTarget)

  /* Per-particle offsets give the morph a stagger, so a figure unfurls
     rather than sliding across as one solid block. */
  const seeds = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) seeds[i] = Math.random()
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const sizes = new Float32Array(COUNT)
  const sizeScale = quality === 'mobile' ? 1.5 : 1
  for (let i = 0; i < COUNT; i++) {
    sizes[i] = (0.011 + Math.random() * 0.011) * sizeScale
  }
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const useMouse = !isSmall && !reducedMotion

  /* How far the curl field may carry a particle out of its lane, how tight
     the swirls are, and how fast they eddy. The mid-flight value is large
     on purpose: the point is a clearly-visible pour from one figure into
     its next. Drift is the same field turned down, applied always, so the
     field never looks frozen while a figure holds. */
  const FLOW = reducedMotion ? 0 : isSmall ? 0.22 : isTablet ? 0.30 : 0.38
  const DRIFT = reducedMotion ? 0 : isSmall ? 0.010 : isTablet ? 0.014 : 0.018

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uFlow: { value: FLOW },
      uDrift: { value: DRIFT },
      uNoiseScale: { value: 1.2 },
      uFlowSpeed: { value: 0.22 },
      /* 1 while the flat logo is at rest: it mutes the idle drift and the
         scroll turn so the artwork is shown square-on and still. */
      uStill: { value: 0 },
      /* Fades a figure out as its section is left, so it is never visible
         in the next section. */
      uPresence: { value: 0 },
      /* Scroll-driven orientation. Kept as a uniform so the rotation is
         applied after the morph, in view space, and therefore looks the
         same from any angle. */
      uTilt: { value: 0 },
      uSpin: { value: 0 },
      /* Parked far outside the figure when mouse interaction is off. */
      uMouse: { value: new THREE.Vector3(50, 50, 50) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)



  /* Build every figure up front, spread across idle callbacks. Generating
     one is a 14,000-point cloud plus a Morton sort, and doing it on the
     frame the reader crosses into a new section is exactly what showed up
     as a stutter during a fast scroll. Pre-warming means a section change
     only ever copies a buffer that already exists. */
  let warm = 0
  let disposed = false
  const warmNext = () => {
    if (disposed || warm >= SHAPES.length) return
    shapeAt(warm++)
    scheduleIdle(warmNext)
  }
  scheduleIdle(warmNext)

  const startTime = performance.now()
  let currentIndex = -1
  let mouse3D = new THREE.Vector3(50, 50, 50)
  /* Scroll is damped every frame, so a flick of the wheel turns into a
     continuous glide rather than a jump between two shapes. */
  let targetProgress = 0
  let progress = 0
  /* Where the figure currently sits against its section, in camera space.
     Damped rather than set, so it glides. */
  let lift = 0

  /* Every figure belongs to one section, and the field walks them in order
     as the reader scrolls. The journey from one figure to the next is not
     owned by either section's "band" — it spans the whole distance between
     the two sections' centres, so the particles flow the entire way rather
     than reshuffling in a short window at a boundary. */
  let scrollCentres = null
  /* Each section's centre in document coordinates, so the figure can be
     framed by the section every frame. */
  let docCentres = null
  /* Scroll length and the canvas rect are read once per layout change and
     cached here, so the per-frame loop never has to touch the DOM — a
     layout read every frame is a reflow, and reflows are a stutter. */
  let scrollMax = 0
  let canvasRect = { top: 0, height: window.innerHeight }
  const measureBands = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max <= 0) return false
    scrollMax = max
    canvasRect = container.getBoundingClientRect()

    const found = []
    for (const { anchor } of SHAPES) {
      const el = anchor ? document.getElementById(anchor) : null
      if (anchor && !el) return false
      found.push(el)
    }
    if (found.some((el, i) => !el && SHAPES[i].anchor)) return false

    docCentres = found.map((el) =>
      el ? el.offsetTop + el.offsetHeight * 0.5 : 0
    )

    /* The scroll offset at which each section's centre sits in the middle
       of the screen. Document offset minus half a viewport — comparing a
       scroll position against a document offset is what left every figure
       half a screen out of step with its own section. */
    const half = window.innerHeight / 2
    const centres = found.map((el) =>
      el
        ? Math.min(Math.max(el.offsetTop + el.offsetHeight * 0.5 - half, 0), max)
        : 0
    )
    /* The last section's centre can sit past the furthest the page scrolls,
       so the final figure is re-centred where it is actually reachable. */
    if (centres.length > 1 && centres[centres.length - 1] > max - 40) {
      centres[centres.length - 1] = Math.min(max * 0.94, max)
    }
    scrollCentres = centres
    return true
  }

  const readScroll = () => {
    if (!scrollCentres) measureBands()
    targetProgress =
      scrollMax > 0 ? Math.min(Math.max(window.scrollY / scrollMax, 0), 1) : 0
  }

  /* The figure is drawn at the origin of a fixed canvas, so it sits in the
     middle of the screen while its own section scrolls past — which is what
     left a shape straddling the line between two sections. Instead each
     figure is framed by the section it belongs to: `sectionCentre` is that
     section's centre in canvas coordinates, and `sectionLift` is the world
     distance from the middle of the canvas to it. Applied to the points
     object, so the figure travels with the section instead of over the gap
     between two.

     Returned in camera-space units: screen y grows downward, world y grows
     upward, hence the sign. */
  const sectionCentre = (index, rect, h) => {
    if (!docCentres || !docCentres[index]) return h / 2
    const centre = docCentres[index] - window.scrollY - rect.top
    /* Only a thin margin: a section arriving from below, or leaving at the
       top, stops at the edge instead of taking the figure with it. Anything
       more would pin the figure in place and undo the tracking. */
    const margin = h * 0.08
    return Math.min(Math.max(centre, margin), h - margin)
  }
  const sectionLift = (index, rect, h) => {
    /* How much world height the camera sees at the figure's plane, and from
       that the world distance of one screen pixel. */
    const visible = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    return ((h / 2 - sectionCentre(index, rect, h)) * visible) / h
  }

  /* Per-frame: ease towards the scroll target, then work out which figure
     the reader is on and how far they have travelled towards the next.
     `snap` places the figure without the easing, for the single frame
     drawn when the reader has asked for reduced motion. */
  // aislop-ignore-next-line complexity/function-too-long -- scroll, morph, orientation and placement share one frame budget and must stay in lockstep.
  const updateMorph = (snap = false, dt = 1 / 60) => {
    /* Frame-rate independent easing. The old fixed fraction per frame
       drifted differently at 60 and 120Hz, and lagged so far behind a fast
       scroll that it caught up in a visible jump. A time constant makes the
       glide identical at any refresh rate and keeps it tracking the scroll. */
    if (snap) {
      progress = targetProgress
    } else {
      progress += (targetProgress - progress) * (1 - Math.exp(-dt / 0.08))
    }
    if (!scrollCentres && !measureBands()) return

    const y = progress * scrollMax
    const centres = scrollCentres
    const last = centres.length - 1

    /* Which journey the reader is on: the stretch between two neighbouring
       sections. The figure shown is that stretch's start shape; the one it
       flows into is its end shape. */
    let index = 0
    for (let i = 0; i < last; i++) {
      if (y >= centres[i]) index = i
    }
    index = Math.min(index, last - 1)

    if (index !== currentIndex) {
      currentIndex = index
      /* Swap the pair the shader interpolates between. Only happens when
         the reader crosses into a new journey, and the shapes stay cached
         around it. */
      const here = shapeAt(index)
      const after = shapeAt(index + 1)
      position.array.set(here.points)
      position.needsUpdate = true
      const target = geometry.getAttribute('aTarget')
      target.array.set(after.points)
      target.needsUpdate = true
      const currentColour = geometry.getAttribute('aColor')
      currentColour.array.set(here.colours)
      currentColour.needsUpdate = true
      const targetColour = geometry.getAttribute('aTargetColor')
      targetColour.array.set(after.colours)
      targetColour.needsUpdate = true
    }

    /* How far along the journey: 0 at this section's centre, 1 at the
       next's. Measured between centres — not between a band edge and a
       boundary — the morph spans almost the whole distance between two
       sections, so the particles flow for the entire scroll rather than
       reshuffling in a short window. The shape holds near each end of the
       journey, so it reads while its own section is on screen. */
    const from = centres[index]
    const to = centres[index + 1]
    const t = Math.min(Math.max((y - from) / Math.max(to - from, 0.0001), 0), 1)
    const HOLD = 0.15
    const morph = smoothstep(
      Math.min(Math.max((t - HOLD) / (1 - 2 * HOLD), 0), 1)
    )

    /* Fit the figure to the field column at this viewport. Interpolated
       with the morph, so the handover between two differently framed
       figures is as smooth as the shapes themselves. */
    const fit = fitFor(index) + (fitFor(index + 1) - fitFor(index)) * morph
    points.scale.setScalar(fit)

    /* The cached canvas rect, so the loop never triggers a reflow. */
    const rect = canvasRect
    const h = rect.height || 1

    /* The figure turns and tips as the reader moves along the journey, so
       the scroll itself animates the object instead of only swapping it.
       Measured between the two centres, so each figure is re-oriented as
       its journey begins. */
    /* The supplied drawings are flat: while one is the resting figure it
       must sit square-on and still, so the turn and idle drift fade out as
       it settles and back in as the reader leaves it. Interpolating between
       the two ends of the journey keeps that handover continuous, instead
       of snapping the orientation when the current figure swaps. */
    const fromFlat = SHAPES[index].flat ? 1 : 0
    const toFlat = SHAPES[index + 1].flat ? 1 : 0
    const still = fromFlat + (toFlat - fromFlat) * morph
    const spin = (t - 0.5) * 0.9 * (1 - still)
    const tilt = (t - 0.5) * 0.5 * (1 - still)
    material.uniforms.uStill.value = still

    /* The morph is the transition, never a fade: the matter is always on
       screen, pouring from one form into the next. */
    material.uniforms.uMorph.value = morph
    material.uniforms.uPresence.value = 1
    material.uniforms.uSpin.value = spin
    material.uniforms.uTilt.value = tilt

    /* The figure sits over the centre of its own section, and slides to the
       next in step with the morph, so the handover happens with the section
       rather than in the gap between two. Damped like the scroll, so a
       flick of the wheel glides it into place instead of snapping. */
    const here = sectionLift(index, rect, h)
    const goal = here + (sectionLift(index + 1, rect, h) - here) * morph
    lift +=
      (goal - lift) * (snap ? 1 : 1 - Math.exp(-dt / 0.09))
    points.position.y = lift
  }

  if (!reducedMotion) {
    window.addEventListener('scroll', readScroll, { passive: true })
    readScroll()
  }

  if (useMouse) {
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const vector = new THREE.Vector3(x, y, 0.5)
      vector.unproject(camera)
      const dir = vector.sub(camera.position).normalize()
      const distance = -camera.position.z / dir.z
      mouse3D = camera.position.clone().add(dir.multiplyScalar(distance))
    }
    document.addEventListener('mousemove', handleMouseMove)
    container.__removeMouseMove = () =>
      document.removeEventListener('mousemove', handleMouseMove)
  }

  let animationId = 0
  let running = false

  let lastFrame = startTime
  const loop = () => {
    animationId = requestAnimationFrame(loop)
    const now = performance.now()
    /* Capped, so a dropped frame or a return to the tab does not ease in
       one enormous step. */
    const dt = Math.min((now - lastFrame) / 1000, 0.05)
    lastFrame = now
    material.uniforms.uTime.value = (now - startTime) / 1000
    updateMorph(false, dt)
    if (useMouse) material.uniforms.uMouse.value.copy(mouse3D)
    renderer.render(scene, camera)
  }
  const start = () => {
    if (running || reducedMotion) return
    running = true
    loop()
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(animationId)
  }

  if (reducedMotion) {
    readScroll()
    progress = targetProgress
    updateMorph(true)
    renderer.render(scene, camera)
  } else {
    start()
  }

  /* A fixed canvas is always on screen, so pausing is keyed to the tab
     being hidden rather than to scroll position. */
  const onVisibility = () => {
    if (document.hidden) stop()
    else start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (w > 0 && h > 0) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    /* Section offsets move when text reflows, so they are re-read. */
    scrollCentres = null
    measureBands()
  })
  resizeObserver.observe(container)

  return () => {
    disposed = true
    stop()
    window.removeEventListener('scroll', readScroll)
    if (container.__removeMouseMove) container.__removeMouseMove()
    document.removeEventListener('visibilitychange', onVisibility)
    resizeObserver.disconnect()
    if (renderer) {
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
    geometry.dispose()
    material.dispose()
  }
}
