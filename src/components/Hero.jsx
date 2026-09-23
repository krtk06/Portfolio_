import { lazy, Suspense, useEffect, useState } from 'react'
import { person } from '../content/site'

const ParticleSphere = lazy(() => import('./ParticleSphere'))

function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  const [quality, setQuality] = useState('tablet')

  useEffect(() => {
    const checkScreen = () => {
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches
      setIsMobile(window.innerWidth < 768)
      setQuality(window.innerWidth >= 1280 && !coarsePointer ? 'desktop' : 'tablet')
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const handleScroll = (e, targetId) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [firstName, lastName] = person.name.split(' ')

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-h1">
            {firstName}<br /><span className="highlight">{lastName}</span>
          </h1>
          <div className="hero-line"></div>
          <p className="hero-sub">
            {person.tagline}
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn-primary" onClick={(e) => handleScroll(e, 'work')}>
              <span>View Work</span>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a href="#contact" className="btn-secondary" onClick={(e) => handleScroll(e, 'contact')}><span>Get In Touch</span></a>
          </div>
        </div>
        {!isMobile && (
          <div className="hero-sphere">
            <Suspense fallback={null}>
              <ParticleSphere quality={quality} />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
