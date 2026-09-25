import { person } from '../content/site'
import ExternalLink from './ExternalLink'

function Hero() {
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
          <p className="figure-label">Fig. 00 — Concept · Code · Deployment</p>
          <h1 className="hero-h1">
            {firstName}<br /><span className="highlight">{lastName}</span>
          </h1>
          <p className="hero-role">
            {person.roleLine}
            <span className="hero-loc"> — {person.location}</span>
          </p>
          <div className="hero-line"></div>
          <p className="hero-proof">{person.proofLine}</p>
          <div className="hero-actions">
            <a href="#work" className="btn-primary" onClick={(e) => handleScroll(e, 'work')}>
              <span>View Work</span>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <ExternalLink href={person.links.resume} className="btn-secondary">
              <span>Download Résumé</span>
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
