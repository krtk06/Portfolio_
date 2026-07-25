import { useEffect, useState } from 'react'
import ParticleSphere from './ParticleSphere'

function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024)
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

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-h1">
            Kartheek<br /><span className="highlight">Nistala</span>
          </h1>
          <div className="hero-line"></div>
          <p className="hero-sub">
            Concept. Code. Deployment.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn-primary" onClick={(e) => handleScroll(e, 'work')}>
              View Work
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a href="#contact" className="btn-secondary" onClick={(e) => handleScroll(e, 'contact')}>Get In Touch</a>
          </div>
        </div>
        {!isMobile && (
          <div className="hero-sphere">
            <ParticleSphere quality={isTablet ? 'tablet' : 'desktop'} />
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero