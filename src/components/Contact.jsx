import { person } from '../content/site'

function Contact() {
  const handleReachOut = () => {
    window.location.href = `mailto:${person.links.email}`
  }

  return (
    <section className="section section-contact" id="contact">
      <div className="section-inner">
        <div className="section-label">Contact</div>
        <h2 className="section-heading">
          Get In <span className="thin">Touch</span>
        </h2>
        <button className="btn-secondary reach-out-btn" onClick={handleReachOut}>
          <span>Reach Out</span>
        </button>
        <p className="contact-text">
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
        </p>
        <div className="contact-socials">
          <button className="contact-social" aria-label="Email" onClick={handleReachOut}>
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </button>
          <a href={person.links.github} className="contact-social" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.236 1.839 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.124-.3-.536-1.527.114-3.18 0 0 1.008-.322 3.301 1.23.957-.276 1.982-.414 3.003-.419 1.02.005 2.046.143 3.002.419 2.291-1.552 3.297-1.23 3.297-1.23.65 1.653.238 2.88.114 3.18.77.84 1.235 1.91 1.235 3.22 0 4.609-2.807 5.628-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .315.192.691.793.577 4.769-.588 8.207-6.085 8.207-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href={person.links.linkedin} className="contact-social" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.638c1.284-1.555 3.984-1.638 4 0v1.638h3v7.326z"/>
            </svg>
          </a>
          <a href={person.links.resume} className="contact-social" target="_blank" rel="noopener noreferrer" aria-label="Resume">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Contact
