import { useEffect, useRef } from 'react'
import { createParticleBackground } from './particleBackgroundEngine'

function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return createParticleBackground(canvas)
  }, [])

  return (
    <div id="canvas-bg" aria-hidden="true">
      <canvas ref={canvasRef} id="particleCanvas"></canvas>
    </div>
  )
}

export default ParticleBackground
