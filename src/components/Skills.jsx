import { skills } from '../content/skills'

function Skills() {
  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
        <p className="figure-label">Fig. 04 — The toolkit</p>
        <h2 className="section-heading">
          What the work<br />
          <span className="thin">was built with</span>
        </h2>

        <ul className="skill-pills" aria-label="Tools">
          {skills.map((tool) => (
            <li className="skill-pill" key={tool}>
              {tool}
            </li>
          ))}
        </ul>

        <p className="data-caption">
          {skills.length} tools · languages to the tooling around them
        </p>
      </div>
    </section>
  )
}

export default Skills
