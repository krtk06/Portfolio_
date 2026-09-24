import { Link } from 'react-router-dom'
import { person } from '../content/site'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand-block">
          <span className="footer-brand">{person.shortName}</span>
          <p className="footer-name">
            {person.name} — {person.roleLine}
          </p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/work">Work</Link>
          <Link to="/#skills">Skills</Link>
          <Link to="/#contact">Contact</Link>
        </nav>
        <div className="footer-socials">
          <a href={person.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={person.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={person.links.resume} target="_blank" rel="noopener noreferrer">Résumé</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copy">
          © {year} {person.name}. All rights reserved.
        </p>
        <a className="footer-email" href={`mailto:${person.links.email}`}>
          {person.links.email}
        </a>
      </div>
    </footer>
  )
}

export default Footer
