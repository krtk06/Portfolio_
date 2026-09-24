import { useEffect, useRef } from 'react'

function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight
    let mouseX = width / 2
    let mouseY = height / 2
    let particles = []
    let animationId

    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024

    const particleCount = isMobile ? 30 : isTablet ? 60 : 120
    const useConnections = !isMobile
    const useMouseInteraction = !isMobile
    const mouseRadius = 120
    const connectionDist = 100
    const frameInterval = 1000 / 30

    canvas.width = width
    canvas.height = height

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.originX = this.x
        this.originY = this.y
        this.size = Math.random() * 2 + 0.5
        this.baseAlpha = Math.random() * 0.3 + 0.1
        this.alpha = this.baseAlpha
      }

      update() {
        if (useMouseInteraction) {
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius
            this.vx += (dx / dist) * force * 0.5
            this.vy += (dy / dist) * force * 0.5
            this.alpha = Math.min(this.baseAlpha + force * 0.4, 0.7)
          } else {
            this.vx += (this.originX - this.x) * 0.002
            this.vy += (this.originY - this.y) * 0.002
            this.alpha = this.baseAlpha
          }
        } else {
          this.vx += (this.originX - this.x) * 0.002
          this.vy += (this.originY - this.y) * 0.002
          this.alpha = this.baseAlpha
        }

        this.vx *= 0.96
        this.vy *= 0.96
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    /* One path, one stroke for every connection — far cheaper than stroking
       each line separately. */
    function drawConnections() {
      if (!useConnections) return
      ctx.beginPath()
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDist) {
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
          }
        }
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.stroke()
    }

    let paused = false
    const handleVisibility = () => {
      paused = document.hidden
      if (paused) {
        cancelAnimationFrame(animationId)
      } else {
        animationId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    let lastFrame = 0
    function animate(now) {
      if (paused) return
      animationId = requestAnimationFrame(animate)

      /* The constellation drifts slowly; 30fps is indistinguishable and
         halves the main-thread cost. */
      if (now - lastFrame < frameInterval) return
      lastFrame = now

      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      drawConnections()
    }

    animationId = requestAnimationFrame(animate)

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    if (useMouseInteraction) {
      document.addEventListener('mousemove', handleMouseMove)
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (useMouseInteraction) {
        document.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div id="canvas-bg" aria-hidden="true">
      <canvas ref={canvasRef} id="particleCanvas"></canvas>
    </div>
  )
}

export default ParticleBackground
