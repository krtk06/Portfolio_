import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SHAPES, orderAlongCurve } from './shapes'

const COUNTS = { mobile: 1800, tablet: 7000, desktop: 14000 }

/* Standard ease, so a transition accelerates away and settles in. */
const smoothstep = (t) => {
  const x = Math.min(Math.max(t, 0), 1)
  return x * x * (3 - 2 * x)
}

function ParticleField() {
  const containerRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanup = null

    const init = () => {
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

      /* Figures are generated on demand, one ahead of the scroll, so opening
         the page does not pay for all seven at once. Each is normalised into
         the camera frame — otherwise a shape authored for a wide viewport
         drifts out of a narrow one.
         `frame` is how much of the camera's height a figure fills, and it is
         per figure: a shape that read as too large in the right-hand column can
         be set back without resizing the ones that were already right. */
      const DEFAULT_FRAME = 0.82
      const built = new Map()
      const shapeAt = (i) => {
        if (built.has(i)) return built.get(i)
        /* Reorder along the Morton curve first, so every figure shares one
           particle order and points travel short paths between shapes. */
        const points = orderAlongCurve(SHAPES[i].build(COUNT), COUNT)
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
        built.set(i, points)
        return points
      }
      /* Keep only the current and adjacent figures; drop the rest. */
      const prune = (i) => {
        for (const key of built.keys()) {
          if (Math.abs(key - i) > 1) built.delete(key)
        }
      }

      const geometry = new THREE.BufferGeometry()
      const position = new THREE.BufferAttribute(new Float32Array(shapeAt(0)), 3)
      geometry.setAttribute('position', position)
      geometry.setAttribute('aTarget', new THREE.BufferAttribute(new Float32Array(shapeAt(1)), 3))

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
          /* Fades a figure out as its section is left, so it is never visible
             in the next section. */
          uPresence: { value: 0 },
          /* Scroll-driven orientation. Kept as a uniform so the rotation is
             applied after the morph, in view space, and therefore looks the
             same from any angle. */
          uTilt: { value: 0 },
          uSpin: { value: 0 },
          ...(useMouse ? { uMouse: { value: new THREE.Vector3(50, 50, 50) } } : {}),
        },
        vertexShader: `
        attribute vec3 aTarget;
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uMorph;
        uniform float uPresence;
        uniform float uTilt;
        uniform float uSpin;
        uniform float uFlow;
        uniform float uDrift;
        uniform float uNoiseScale;
        uniform float uFlowSpeed;
        ${useMouse ? 'uniform vec3 uMouse;' : ''}
        varying float vFade;

        /* 3D simplex noise (Ashima / Stefan Gustavson). The field needs a
           smooth, cheap function of position to sample, and this is the usual
           one: a handful of hashed gradients, interpolated. */
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        vec3 snoiseVec3(vec3 p) {
          return vec3(
            snoise(p),
            snoise(p + vec3(19.19, 7.13, 3.37)),
            snoise(p + vec3(11.31, 27.70, 5.50))
          );
        }

        /* Curl of a noise potential: the direction the noise field would
           swirl in. Because it is a curl, it is divergence-free, so particles
           are carried around in loops rather than piled up — the difference
           between a fluid and a drift. */
        vec3 curlNoise(vec3 p) {
          const float e = 0.06;
          vec3 dx = vec3(e, 0.0, 0.0);
          vec3 dy = vec3(0.0, e, 0.0);
          vec3 dz = vec3(0.0, 0.0, e);

          vec3 p0 = snoiseVec3(p);
          vec3 px = snoiseVec3(p + dx);
          vec3 py = snoiseVec3(p + dy);
          vec3 pz = snoiseVec3(p + dz);

          float x = (py.z - p0.z) - (pz.y - p0.y);
          float y = (pz.x - p0.x) - (px.z - p0.z);
          float z = (px.y - p0.y) - (py.x - p0.x);
          /* Direction only; the caller decides how far along it to travel. */
          return normalize(vec3(x, y, z));
        }

        /* Rotate about Y then tilt about X, so the figure turns and tips as
           the reader moves down the page. */
        vec3 orient(vec3 p) {
          float c = cos(uSpin);
          float sn = sin(uSpin);
          p = vec3(p.x * c - p.z * sn, p.y, p.x * sn + p.z * c);
          float ct = cos(uTilt);
          float st = sin(uTilt);
          return vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
        }

        void main() {
          float t = clamp(uMorph, 0.0, 1.0);
          /* Stagger: every particle leaves and arrives on its own schedule. A
             wide window — up to nearly half the morph — is what turns the swap
             into a pour: points set off one after another rather than as one
             block. */
          float delay = aSeed * 0.6;
          float local = clamp((t - delay) / (1.0 - delay), 0.0, 1.0);
          /* Smootherstep, so each point eases out of the old form and into the
             new one with no visible corner at either end. */
          local = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);

          vec3 pos = mix(position, aTarget, local);

          /* Sample the curl field where the particle currently is. Being a
             curl it is divergence-free, so the cloud eddies and swirls rather
             than sliding along straight lines, and points loop around instead
             of piling up. */
          vec3 swirl = curlNoise(pos * uNoiseScale + vec3(uTime * uFlowSpeed));

          /* Two strengths of the same field. Mid-flight it carries particles a
             long way out of their lane — the pour from one figure into the
             next. At rest a fraction of it keeps the figure alive, so a held
             shape still breathes rather than sitting frozen. */
          float flow = sin(local * 3.14159);
          pos += swirl * flow * uFlow * (0.4 + aSeed);
          pos += swirl * uDrift * (0.5 + aSeed);

          /* A small arc on top, so every particle still travels rather than
             slides. Kept tight now that the curl does most of the work. */
          float arc = flow * (0.015 + aSeed * 0.03);
          pos += normalize(vec3(aSeed - 0.5, aSeed - 0.5, 0.35)) * arc;

          /* Slow drift, so the figure breathes when the scroll is still. */
          pos += vec3(
            sin(uTime * 0.6 + aSeed * 6.28),
            cos(uTime * 0.5 + aSeed * 6.28),
            0.0
          ) * 0.008;

          ${useMouse ? `
          vec3 toMouse = pos - uMouse;
          float dist = length(toMouse);
          if (dist < 0.9) {
            pos += normalize(toMouse) * (0.9 - dist) * (0.9 - dist) * 0.4;
          }
          ` : ''}

          /* Orientation is applied after the morph and the arc, so particles
             travel between shapes and the whole figure turns together. */
          vec3 placed = orient(pos);
          vec4 mvPosition = modelViewMatrix * vec4(placed, 1.0);
          gl_PointSize = aSize * 760.0 / max(-mvPosition.z, 0.5);
          /* Dimmed while forming, and scaled to zero when this figure is not
             the one on screen, so it never bleeds into the next section. */
          vFade = (1.0 - abs(local - 0.5) * 0.12) * uPresence;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragmentShader: `
        varying float vFade;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          float alpha = (1.0 - r * 2.0) * 1.0 * vFade;
          gl_FragColor = vec4(vec3(0.80, 0.82, 0.86) * 0.95, alpha);
        }
      `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

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
      const measureBands = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (max <= 0) return false

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
        const max = document.documentElement.scrollHeight - window.innerHeight
        targetProgress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
        if (!scrollCentres) measureBands()
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
      const updateMorph = (snap = false) => {
        progress += (targetProgress - progress) * 0.09
        if (!scrollCentres && !measureBands()) return

        const y = progress * (document.documentElement.scrollHeight - window.innerHeight)
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
          position.array.set(shapeAt(index))
          position.needsUpdate = true
          const target = geometry.getAttribute('aTarget')
          target.array.set(shapeAt(index + 1))
          target.needsUpdate = true
          prune(index)
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

        /* Where the field's canvas sits on screen, and how tall it is. Read once
           a frame and shared by the figure's placement. */
        const rect = container.getBoundingClientRect()
        const h = rect.height || 1

        /* The morph is the transition, never a fade: the matter is always on
           screen, pouring from one form into the next. */
        material.uniforms.uMorph.value = morph
        material.uniforms.uPresence.value = 1
        /* The figure turns and tips as the reader moves along the journey, so
           the scroll itself animates the object instead of only swapping it.
           Measured between the two centres, so each figure is re-oriented as
           its journey begins. */
        material.uniforms.uSpin.value = (t - 0.5) * 0.9
        material.uniforms.uTilt.value = (t - 0.5) * 0.5

        /* The figure sits over the centre of its own section, and slides to the
           next in step with the morph, so the handover happens with the section
           rather than in the gap between two. Damped like the scroll, so a
           flick of the wheel glides it into place instead of snapping. */
        const here = sectionLift(index, rect, h)
        const goal = here + (sectionLift(index + 1, rect, h) - here) * morph
        lift += (goal - lift) * (snap ? 1 : 0.12)
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

      const loop = () => {
        animationId = requestAnimationFrame(loop)
        material.uniforms.uTime.value = (performance.now() - startTime) / 1000
        updateMorph()
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

    const schedule = typeof window.requestIdleCallback === 'function'
      ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
      : (fn) => setTimeout(fn, 100)

    schedule(() => {
      if (cancelled) return
      cleanup = init()
    })

    return () => {
      cancelled = true
      if (cleanup) cleanup()
      initialized.current = false
    }
  }, [])

  return <div ref={containerRef} className="particle-field" aria-hidden="true" />
}

export default ParticleField
