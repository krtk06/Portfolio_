import { skillGroups } from '../content/skills'

const iconUrl = (icon) => `https://icon.icepanel.io/Technology/svg/${encodeURIComponent(icon)}.svg`

function Skills() {
  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
        <p className="figure-label">Fig. 04 — Capability map</p>
        <h2 className="section-heading">
          Technical <span className="thin">Skills</span>
        </h2>
        <div className="skill-groups">
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.label}>
              <h3 className="skill-group-label">{group.label}</h3>
              <div className="skills-grid">
                {group.skills.map((skill) => (
                  <div key={skill.name} className="skill-card">
                    <div className="skill-card-logo">
                      <img
                        src={iconUrl(skill.icon)}
                        alt=""
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <span className="skill-card-label">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
