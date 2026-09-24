import { experience } from '../content/experience'

function Experience() {
  if (!experience.length) return null

  return (
    <section className="section section-experience" id="experience">
      <div className="section-inner">
        <div className="section-label">Experience</div>
        <h2 className="section-heading">
          Where I have <span className="thin">worked</span>
        </h2>
        <div className="experience-list">
          {experience.map((entry) => (
            <article className="experience-entry" key={`${entry.company}-${entry.title}`}>
              <h3 className="experience-title">{entry.title}</h3>
              <p className="experience-meta">
                {entry.companyUrl ? (
                  <a href={entry.companyUrl} target="_blank" rel="noopener noreferrer">
                    {entry.company}
                  </a>
                ) : (
                  entry.company
                )}
                {entry.dates ? ` • ${entry.dates}` : ''}
                {entry.location ? ` • ${entry.location}` : ''}
              </p>
              <ul className="experience-bullets">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience
