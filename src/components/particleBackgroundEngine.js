/**
 * The constellation behind the secondary pages. Kept outside the React
 * component so the canvas engine can be reasoned about and tested without
 * mounting the component.
 */

const PARTICLE_COUNT = { mobile: 30, tablet: 60, desktop: 80 }
const MOUSE_RADIUS = 120
const CONNECTION_DISTANCE = 100
const FRAME_INTERVAL = 1000 / 24

class Particle {
  constructor(env) {
    this.env = env
    this.x = Math.random() * env.width
    this.y = Math.random() * env.height
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    this.originX = this.x
    this.originY = this.y
    this.size = Math.random() * 2 + 0.5
    this.baseAlpha = Math.random() * 0.3 + 0.1
    this.alpha = this.baseAlpha
  }

  update() {
    const { env } = this
    if (env.useMouseInteraction) {
      const dx = this.x - env.mouseX
      const dy = this.y - env.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
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

    if (this.x < 0 || this.x > env.width) this.vx *= -1
    if (this.y < 0 || this.y > env.height) this.vy *= -1
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
    ctx.fill()
  }
}

/* One path, one stroke for every connection — far cheaper than stroking each
   line separately. */
function drawConnections(ctx, particles, enabled) {
  if (!enabled) return
  ctx.beginPath()
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DISTANCE) {
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
    }
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.stroke()
}

function createFrameLoop(ctx, env, particles, connections) {
  let lastFrame = 0
  let paused = false
  let animationId

  const animate = (now) => {
    if (paused) return
    animationId = requestAnimationFrame(animate)
    /* The constellation drifts slowly; a low frame rate is indistinguishable
       and keeps the main thread free. */
    if (now - lastFrame < FRAME_INTERVAL) return
    lastFrame = now
    ctx.clearRect(0, 0, env.width, env.height)
    particles.forEach((particle) => {
      particle.update()
      particle.draw(ctx)
    })
    drawConnections(ctx, particles, connections)
  }

  return {
    start() {
      paused = false
      animationId = requestAnimationFrame(animate)
    },
    pause() {
      paused = true
      cancelAnimationFrame(animationId)
    },
    stop() {
      paused = true
      cancelAnimationFrame(animationId)
    },
  }
}

export function createParticleBackground(canvas) {
  const ctx = canvas.getContext('2d')
  const env = {
    width: window.innerWidth,
    height: window.innerHeight,
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    useMouseInteraction: window.innerWidth >= 768,
  }
  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024
  const count = isMobile ? PARTICLE_COUNT.mobile : isTablet ? PARTICLE_COUNT.tablet : PARTICLE_COUNT.desktop

  canvas.width = env.width
  canvas.height = env.height
  const particles = Array.from({ length: count }, () => new Particle(env))
  const loop = createFrameLoop(ctx, env, particles, !isMobile)

  let started = false

  const handleVisibility = () => {
    if (document.hidden) loop.pause()
    else if (started) loop.start()
  }
  document.addEventListener('visibilitychange', handleVisibility)

  const handleMouseMove = (event) => {
    env.mouseX = event.clientX
    env.mouseY = event.clientY
  }
  if (env.useMouseInteraction) {
    document.addEventListener('mousemove', handleMouseMove)
  }

  const handleResize = () => {
    env.width = window.innerWidth
    env.height = window.innerHeight
    canvas.width = env.width
    canvas.height = env.height
  }
  window.addEventListener('resize', handleResize)

  /* Decorative only — start once the browser is idle so it never competes
     with the first paint or with interaction. */
  const schedule =
    typeof window.requestIdleCallback === 'function'
      ? (fn) => window.requestIdleCallback(fn, { timeout: 1500 })
      : (fn) => setTimeout(fn, 150)
  schedule(() => {
    if (started || document.hidden) return
    started = true
    loop.start()
  })

  return () => {
    loop.stop()
    document.removeEventListener('visibilitychange', handleVisibility)
    if (env.useMouseInteraction) {
      document.removeEventListener('mousemove', handleMouseMove)
    }
    window.removeEventListener('resize', handleResize)
  }
}
