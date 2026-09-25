import { skillGroups } from '../content/skills'

function Skills() {
  const total = skillGroups.reduce((sum, group) => sum + group.skills.length, 0)

  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
        <p className="figure-label">Fig. 04 — Capability map</p>
        <h2 className="section-heading">
          Modeling, infrastructure,<br />
          <span className="thin">and the interfaces around them</span>
        </h2>
        <div className="skill-groups">
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.label}>
              <b className="skill-group-label">{group.label}</b>
              <span className="skill-group-list">
                {group.skills.map((skill) => skill.name).join(' · ')}
              </span>
            </div>
          ))}
        </div>
        <p className="data-caption">{skillGroups.length} groups · {total} tools · SQL included</p>
      </div>
    </section>
  )
}

export default Skills
