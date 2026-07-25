import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-brand" onClick={handleHomeClick}>
        <span className="nav-brand-text">krtk</span>
      </Link>
      <div className="nav-links">
        {!isHome && (
          <Link to="/" className="nav-back" onClick={handleHomeClick}>
            ← Back
          </Link>
        )}
        <a href="#work" onClick={(e) => handleNavClick(e, 'work')}>Work</a>
        <a href="#skills" onClick={(e) => handleNavClick(e, 'skills')}>Skills</a>
        <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
      </div>
      <button
        className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {!isHome && (
          <Link to="/" onClick={handleHomeClick}>
            ← Back
          </Link>
        )}
        <Link to="/" onClick={(e) => handleNavClick(e, 'work')}>Work</Link>
        <Link to="/" onClick={(e) => handleNavClick(e, 'skills')}>Skills</Link>
        <Link to="/" onClick={(e) => handleNavClick(e, 'contact')}>Contact</Link>
      </div>
    </nav>
  )
}

export default Navbar
