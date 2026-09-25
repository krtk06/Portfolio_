import { useState } from 'react'
import { person } from '../content/site'
import ExternalLink from './ExternalLink'

function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(person.links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard access can be blocked; the mailto link still works. */
    }
  }

  return (
    <section className="section section-contact" id="contact">
      <div className="section-inner">
        <p className="figure-label">Fig. 05 — Contact</p>
        <h2 className="section-heading">
          Let's build something<br />
          <span className="thin">measurable</span>
        </h2>
        <p className="contact-text">
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
        </p>
        <div className="contact-email-row">
          <a className="contact-email" href={`mailto:${person.links.email}`}>
            {person.links.email}
          </a>
          <button className="contact-copy" type="button" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="contact-links">
          <a className="data-link" href={`mailto:${person.links.email}`}>email</a>
          <ExternalLink className="data-link" href={person.links.github}>github</ExternalLink>
          <ExternalLink className="data-link" href={person.links.linkedin}>linkedin</ExternalLink>
          <ExternalLink className="data-link" href={person.links.resume}>résumé</ExternalLink>
        </div>
      </div>
    </section>
  )
}

export default Contact
