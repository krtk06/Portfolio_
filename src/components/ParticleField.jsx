import { useEffect, useRef } from 'react'
import { createParticleField } from './particleFieldEngine'

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
    const schedule = typeof window.requestIdleCallback === 'function'
      ? (fn) => window.requestIdleCallback(fn, { timeout: 2000 })
      : (fn) => setTimeout(fn, 100)

    schedule(() => {
      if (cancelled) return
      cleanup = createParticleField(container)
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
