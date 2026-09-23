import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function ParticleSphere({ quality = 'desktop' }) {
  const containerRef = useRef(null)
  const initialized = useRef(false)

  const particleCounts = { tablet: 3000, desktop: 18000 }
  const PARTICLE_COUNT = particleCounts[quality] || 18000

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const container = containerRef.current
    if (!container) return

    if (container.querySelector('canvas')) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const width = container.clientWidth || 600
    const height = container.clientHeight || 600

    const renderer = new THREE.WebGLRenderer({ antialias: quality === 'desktop', alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 3

    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    const c1 = new THREE.Color(0xf0f0f0)
    const c2 = new THREE.Color(0x8a8a8a)
    const c3 = new THREE.Color(0xd0d0d0)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.85 + Math.random() * 0.15

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const t = i / PARTICLE_COUNT
      let color
      if (t < 0.5) color = c1.clone().lerp(c2, t * 2)
      else color = c2.clone().lerp(c3, (t - 0.5) * 2)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 0.012 + Math.random() * 0.012
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const useMouse = quality === 'desktop'

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        ...(useMouse ? { uMouse: { value: new THREE.Vector3(50, 50, 50) } } : {})
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        ${useMouse ? 'uniform vec3 uMouse;' : ''}
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          float breath = sin(uTime * 2.0 + position.x * 6.0) * 0.015;
          pos += normalize(pos) * breath;
          
          ${useMouse ? `
          vec3 toMouse = pos - uMouse;
          float dist = length(toMouse);
          if (dist < 1.3) {
            float push = (1.3 - dist) * (1.3 - dist) * 0.3;
            pos += normalize(toMouse) * push;
          }
          ` : ''}
          
          float maxRadius = 1.2;
          float currentRadius = length(pos);
          if (currentRadius > maxRadius) {
            pos = normalize(pos) * maxRadius;
          }
          if (currentRadius < 0.7) {
            pos = normalize(pos) * 0.7;
          }
          
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

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const startTime = performance.now()
    let mouse3D = new THREE.Vector3(50, 50, 50)
    let isDragging = false
    let startX = 0
    let startY = 0
    let dragRotationY = 0
    let dragRotationX = 0
    let returnAnimation = { active: false, startY: 0, startX: 0, progress: 0 }

    if (useMouse && !reducedMotion) {
      const handleMouseDown = (e) => {
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        dragRotationY = particles.rotation.y
        dragRotationX = particles.rotation.x
        returnAnimation.active = false
      }

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        const vector = new THREE.Vector3(x, y, 0.5)
        vector.unproject(camera)
        const dir = vector.sub(camera.position).normalize()
        const distance = -camera.position.z / dir.z
        mouse3D = camera.position.clone().add(dir.multiplyScalar(distance))

        if (isDragging) {
          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY
          particles.rotation.y = dragRotationY + deltaX * 0.005
          particles.rotation.x = dragRotationX + deltaY * 0.005
        }
      }

      const handleMouseUp = () => {
        if (isDragging) {
          isDragging = false
          dragRotationY = particles.rotation.y
          dragRotationX = particles.rotation.x
          returnAnimation = {
            active: true,
            startY: dragRotationY,
            startX: dragRotationX,
            progress: 0
          }
        }
      }

      const handleMouseLeave = () => {
        mouse3D = new THREE.Vector3(50, 50, 50)
        if (isDragging) {
          isDragging = false
          dragRotationY = particles.rotation.y
          dragRotationX = particles.rotation.x
          returnAnimation = {
            active: true,
            startY: dragRotationY,
            startX: dragRotationX,
            progress: 0
          }
        }
      }

      container.addEventListener('mousedown', handleMouseDown)
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseup', handleMouseUp)
      container.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('mouseup', handleMouseUp)
    }

    const renderFrame = () => {
      const time = (performance.now() - startTime) / 1000
      material.uniforms.uTime.value = time
      if (useMouse) {
        material.uniforms.uMouse.value.copy(mouse3D)
      }

      if (useMouse) {
        if (isDragging) {
          particles.position.y = Math.sin(time * 0.6) * 0.02
        } else if (returnAnimation.active) {
          returnAnimation.progress += 0.02
          const t = Math.min(returnAnimation.progress, 1)
          const ease = 1 - Math.pow(1 - t, 3)

          const targetY = time * 0.12
          const targetX = Math.sin(time * 0.3) * 0.05

          particles.rotation.y = returnAnimation.startY + (targetY - returnAnimation.startY) * ease
          particles.rotation.x = returnAnimation.startX + (targetX - returnAnimation.startX) * ease

          if (t >= 1) {
            returnAnimation.active = false
          }
        } else {
          particles.rotation.y = time * 0.12
          particles.rotation.x = Math.sin(time * 0.3) * 0.05
          particles.position.y = Math.sin(time * 0.6) * 0.02
        }
      } else {
        particles.rotation.y = time * 0.12
        particles.rotation.x = Math.sin(time * 0.3) * 0.05
        particles.position.y = Math.sin(time * 0.6) * 0.02
      }

      renderer.render(scene, camera)
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
      particles.rotation.y = 0.6
      particles.rotation.x = 0.05
      renderer.render(scene, camera)
    } else {
      start()
    }

    /* Pause the render loop while the sphere is off-screen. */
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
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      if (renderer) {
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
      if (geometry) geometry.dispose()
      if (material) material.dispose()
      initialized.current = false
    }
  }, [quality])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />
}

export default ParticleSphere
