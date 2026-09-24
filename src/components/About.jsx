import { person } from '../content/site'

function About() {
  return (
    <section className="section section-about" id="about">
      <div className="section-inner">
        <div className="section-label">About</div>
        <h2 className="section-heading">
          How I <span className="thin">work</span>
        </h2>
        <div className="about-body">
          {person.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
