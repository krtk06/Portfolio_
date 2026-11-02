import { skills } from '../content/skills'

function Skills() {
  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
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
      </div>
    </section>
  )
}

export default Skills
