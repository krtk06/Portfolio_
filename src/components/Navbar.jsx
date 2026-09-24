import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { person } from '../content/site'

const sections = [
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const getScrollTop = () =>
      document.body.scrollTop || document.documentElement.scrollTop || window.scrollY || 0

    const handleScroll = () => {
      setScrolled(getScrollTop() > 80)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [])

  /* Highlight the section currently in view. */
  useEffect(() => {
    if (!isHome) {
      setActiveSection('')
      return
    }

    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [isHome])

  /* Escape closes the mobile menu. */
  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavClick = (e, sectionId) => {
    e.preventDefault()
    closeMenu()
    if (isHome) {
      scrollToSection(sectionId)
    } else {
      navigate('/', { replace: false })
      setTimeout(() => scrollToSection(sectionId), 100)
    }
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    closeMenu()
    if (isHome) {
      scrollToSection('hero')
    } else {
      navigate('/')
    }
  }

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} aria-label="Main">
      <Link to="/" className="nav-brand" onClick={handleHomeClick}>
        <span className="nav-brand-text">krtk</span>
      </Link>
      <div className="nav-links">
        {!isHome && (
          <Link to="/" className="nav-back" onClick={handleHomeClick}>
            ← Back
          </Link>
        )}
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? 'active' : undefined}
            aria-current={activeSection === id ? 'true' : undefined}
            onClick={(e) => handleNavClick(e, id)}
          >
            {label}
          </a>
        ))}
        <a href={person.links.resume} target="_blank" rel="noopener noreferrer">Résumé</a>
      </div>
      <button
        className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div id="mobile-menu" className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {!isHome && (
          <Link to="/" onClick={handleHomeClick}>
            ← Back
          </Link>
        )}
        {sections.map(({ id, label }) => (
          <Link key={id} to="/" onClick={(e) => handleNavClick(e, id)}>
            {label}
          </Link>
        ))}
        <a href={person.links.resume} target="_blank" rel="noopener noreferrer">Résumé</a>
      </div>
    </nav>
  )
}

export default Navbar
