import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SHAPES } from './shapes'

const COUNTS = { mobile: 1800, tablet: 6000, desktop: 11000 }

/* Scroll positions, as a fraction of the scrollable height, where each shape
   should be fully formed. These line up with the sections on the home page. */
const STOPS = [0, 0.18, 0.33, 0.5, 0.68, 0.84, 1]

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
         drifts out of a narrow one. */
      const frame = 0.82
      const built = new Map()
      const shapeAt = (i) => {
        if (built.has(i)) return built.get(i)
        const points = SHAPES[i].build(COUNT)
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

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          ...(useMouse ? { uMouse: { value: new THREE.Vector3(50, 50, 50) } } : {}),
        },
        vertexShader: `
        attribute vec3 aTarget;
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uMorph;
        ${useMouse ? 'uniform vec3 uMouse;' : ''}
        varying float vFade;

        void main() {
          float t = clamp(uMorph, 0.0, 1.0);
          /* Stagger: every particle leaves and arrives on its own schedule. */
          float delay = aSeed * 0.35;
          float local = clamp((t - delay) / (1.0 - delay), 0.0, 1.0);
          local = local * local * (3.0 - 2.0 * local);

          vec3 pos = mix(position, aTarget, local);

          /* A small arc mid-flight, so particles travel rather than slide. */
          float arc = sin(local * 3.14159) * (0.1 + aSeed * 0.14);
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

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * 420.0 / max(-mvPosition.z, 0.5);
          vFade = 1.0 - abs(local - 0.5) * 0.25;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragmentShader: `
        varying float vFade;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          float alpha = (1.0 - r * 2.0) * 0.95 * vFade;
          gl_FragColor = vec4(vec3(0.88, 0.90, 0.95) * 2.6, alpha);
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

      /* Map scroll position to a shape index and the blend towards the next. */
      const readScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
        const span = STOPS.length - 1
        const seg = p * span
        const index = Math.min(Math.floor(seg), span - 1)

        if (index !== currentIndex) {
          currentIndex = index
          /* Swap the pair the shader interpolates between. Only happens when
             the section changes, and the figures are cached around it. */
          position.array.set(shapeAt(index))
          position.needsUpdate = true
          const target = geometry.getAttribute('aTarget')
          target.array.set(shapeAt(index + 1))
          target.needsUpdate = true
          prune(index)
        }
        /* HOLD is the share of each gap the shape simply stays put, so a
           figure is readable rather than permanently dissolving. */
        const HOLD = 0.45
        const frac = seg - index
        const morph = frac <= HOLD / 2
          ? 0
          : frac >= 1 - HOLD / 2
            ? 1
            : (frac - HOLD / 2) / (1 - HOLD)
        material.uniforms.uMorph.value = Math.min(Math.max(morph, 0), 1)
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
