import { lazy, Suspense, useEffect, useState } from 'react'
import { person } from '../content/site'

const ParticleSphere = lazy(() => import('./ParticleSphere'))

/*
 * TEMPORARY review scaffolding: pick the hero variant with ?comp=a|b|c.
 * The chosen variant gets locked in and this switch is removed before the
 * phase is done.
 */
const comp = new URLSearchParams(window.location.search).get('comp') || 'a'

const proofTokens = person.proofLine.split('•').map((token) => token.trim())

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
  const roleLine = `${person.roleLine} — ${person.location}`

  return (
    <section className="hero" id="hero" data-comp={comp}>
      <div className="hero-content">
        <div className="hero-text">
          {comp === 'a' && (
            <>
              <p className="hero-eyebrow">{roleLine}</p>
              <h1 className="hero-h1">
                {firstName}<br /><span className="highlight">{lastName}</span>
              </h1>
              <div className="hero-line"></div>
              <p className="hero-sub">{person.tagline}</p>
              <p className="hero-proof">{person.proofLine}</p>
            </>
          )}
          {comp === 'b' && (
            <>
              <p className="hero-eyebrow">{person.tagline}</p>
              <h1 className="hero-h1">
                {firstName}<br /><span className="highlight">{lastName}</span>
              </h1>
              <p className="hero-role">
                {person.roleLine}
                <span className="hero-loc"> — {person.location}</span>
              </p>
              <div className="hero-line"></div>
              <p className="hero-proof">{person.proofLine}</p>
            </>
          )}
          {comp === 'c' && (
            <>
              <p className="hero-eyebrow">{person.tagline}</p>
              <h1 className="hero-h1">
                {firstName}<br /><span className="highlight">{lastName}</span>
              </h1>
              <p className="hero-role">{roleLine}</p>
              <div className="hero-line"></div>
              <ul className="hero-proof-strip">
                {proofTokens.map((token) => (
                  <li key={token}>{token}</li>
                ))}
              </ul>
            </>
          )}
          <div className="hero-actions">
            <a href="#work" className="btn-primary" onClick={(e) => handleScroll(e, 'work')}>
              <span>View Work</span>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a
              href={person.links.resume}
              className="btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Download Résumé</span>
            </a>
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
