import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { projects } from '../content/projects'
import { skillGroups } from '../content/skills'

const COUNTS = { mobile: 4000, tablet: 6000, desktop: 10000 }

const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5

/* Every figure is laid out on the camera plane so the morphs read as flat
   charts, except the sphere which keeps its depth. */
function buildFigures(count, plane) {
  const sphere = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 0.85 + Math.random() * 0.15
    sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    sphere[i * 3 + 2] = r * Math.cos(phi)
  }

  const centers = projects.map((_, i) => [
    ((i + 0.5) / projects.length - 0.5) * plane.w * 0.86,
    ((i % 2) - 0.5) * plane.h * 0.3,
  ])
  const scatter = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const c = centers[i % centers.length]
    scatter[i * 3] = c[0] + gauss() * plane.w * 0.07
    scatter[i * 3 + 1] = c[1] + gauss() * plane.h * 0.14
    scatter[i * 3 + 2] = (Math.random() - 0.5) * 0.15
  }

  const total = skillGroups.reduce((sum, g) => sum + g.skills.length, 0)
  const groups = skillGroups.map((g, i) => ({
    x: ((i + 1) / (skillGroups.length + 1) - 0.5) * plane.w,
    w: (plane.w / (skillGroups.length + 1)) * 0.55,
    h: (g.skills.length / total) * plane.h * 0.85,
  }))
  const bars = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const g = groups[i % groups.length]
    bars[i * 3] = g.x + (Math.random() - 0.5) * g.w
    bars[i * 3 + 1] = -plane.h / 2 + Math.random() * g.h
    bars[i * 3 + 2] = (Math.random() - 0.5) * 0.1
  }

  const nodes = projects.map((_, i) => ((i + 0.5) / projects.length - 0.5) * plane.w * 0.9)
  const timeline = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = Math.random()
    const x = -plane.w * 0.45 + t * plane.w * 0.9
    const near = nodes.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a))
    const onNode = Math.random() < 0.35
    timeline[i * 3] = onNode ? near + (Math.random() - 0.5) * 0.03 : x
    timeline[i * 3 + 1] = (Math.random() - 0.5) * 0.05
    timeline[i * 3 + 2] = (Math.random() - 0.5) * 0.1
  }

  return { sphere, scatter, bars, timeline }
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
      const COUNT = COUNTS[quality] || 10000

      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight

      const renderer = new THREE.WebGLRenderer({ antialias: quality === 'desktop', alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      camera.position.z = 3

      const planeH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
      const plane = { w: planeH * (width / height), h: planeH }

      const { sphere, scatter, bars, timeline } = buildFigures(COUNT, plane)

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(sphere, 3))
      geometry.setAttribute('aFigure1', new THREE.BufferAttribute(scatter, 3))
      geometry.setAttribute('aFigure2', new THREE.BufferAttribute(bars, 3))
      geometry.setAttribute('aFigure3', new THREE.BufferAttribute(timeline, 3))

      const sizes = new Float32Array(COUNT)
      for (let i = 0; i < COUNT; i++) sizes[i] = 0.012 + Math.random() * 0.012
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const useMouse = !isSmall

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uFigure: { value: 0 },
          ...(useMouse ? { uMouse: { value: new THREE.Vector3(50, 50, 50) } } : {})
        },
        vertexShader: `
        attribute vec3 aFigure1;
        attribute vec3 aFigure2;
        attribute vec3 aFigure3;
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uFigure;
        ${useMouse ? 'uniform vec3 uMouse;' : ''}
        
        void main() {
          float f = clamp(uFigure, 0.0, 3.0);
          vec3 base;
          if (f < 1.0) base = mix(position, aFigure1, f);
          else if (f < 2.0) base = mix(aFigure1, aFigure2, f - 1.0);
          else base = mix(aFigure2, aFigure3, f - 2.0);
          
          vColor = color;
          vec3 pos = base;
          
          float breath = sin(uTime * 2.0 + base.x * 6.0) * 0.015;
          pos += normalize(base + vec3(0.001)) * breath;
          
          ${useMouse ? `
          vec3 toMouse = pos - uMouse;
          float dist = length(toMouse);
          if (dist < 1.3) {
            float push = (1.3 - dist) * (1.3 - dist) * 0.3;
            pos += normalize(toMouse) * push;
          }
          ` : ''}
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * 350.0 / max(-mvPosition.z, 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
        fragmentShader: `
        varying vec3 vColor;
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          float alpha = (1.0 - r * 2.0) * 0.95;
          gl_FragColor = vec4(vColor * 2.2, alpha);
        }
      `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

      const startTime = performance.now()
      let targetFigure = 0

      const readScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        targetFigure = Math.min(Math.max(window.scrollY / (max || 1), 0), 1) * 3
      }
      if (!reducedMotion) {
        window.addEventListener('scroll', readScroll, { passive: true })
        readScroll()
      }

      const renderFrame = () => {
        const time = (performance.now() - startTime) / 1000
        material.uniforms.uTime.value = time
        material.uniforms.uFigure.value +=
          (targetFigure - material.uniforms.uFigure.value) * 0.07
        if (useMouse) {
          material.uniforms.uMouse.value.copy(mouse3D)
        }
        renderer.render(scene, camera)
      }

      let mouse3D = new THREE.Vector3(50, 50, 50)

      if (useMouse && !reducedMotion) {
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
        container.addEventListener('mousemove', handleMouseMove)
        container.__removeMouseMove = () => container.removeEventListener('mousemove', handleMouseMove)
      }

      let animationId = 0
      let running = false

      const loop = () => {
        animationId = requestAnimationFrame(loop)
        renderFrame()
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
        material.uniforms.uFigure.value = targetFigure
        renderer.render(scene, camera)
      } else {
        start()
      }

      const intersectionObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      })
      intersectionObserver.observe(container)

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
        intersectionObserver.disconnect()
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

    /* The particle build and shader compile happen once the browser is idle. */
    const schedule = typeof window.requestIdleCallback === 'function'
      ? (fn) => window.requestIdleCallback(fn, { timeout: 1200 })
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
