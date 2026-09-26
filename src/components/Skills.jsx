import { useState } from 'react'
import { Link } from 'react-router-dom'
import { skillDomains } from '../content/skills'
import { getProject, projects } from '../content/projects'

function Skills() {
  const [active, setActive] = useState(skillDomains[0].id)
  const domain = skillDomains.find((item) => item.id === active)
  const top = Math.max(...domain.tools.map((tool) => tool.count))

  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
        <p className="figure-label">Fig. 04 — Where the work sits</p>
        <h2 className="section-heading">
          Four kinds of problem,<br />
          <span className="thin">one toolkit</span>
        </h2>

        <div className="domain-tabs" role="tablist" aria-label="Skill domains">
          {skillDomains.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={item.id === active}
              aria-controls="domain-panel"
              className={`domain-tab${item.id === active ? ' is-active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className="domain-panel"
          role="tabpanel"
          id="domain-panel"
          aria-labelledby={`tab-${domain.id}`}
        >
          <p className="domain-blurb">{domain.blurb}</p>

          <ul className="tool-list">
            {domain.tools.map((tool) => (
              <li className="tool-row" key={tool.name}>
                <span className="tool-name">{tool.name}</span>
                <span className="tool-bar" aria-hidden="true">
                  <span
                    className="tool-bar-fill"
                    style={{ width: `${(tool.count / top) * 100}%` }}
                  />
                </span>
                <span className="tool-count">
                  {tool.count} of {projects.length}
                </span>
              </li>
            ))}
          </ul>

          <p className="domain-evidence">
            <span className="domain-evidence-label">Proven by</span>
            {domain.projects.map((slug) => {
              const project = getProject(slug)
              if (!project) return null
              return (
                <Link key={slug} to={`/work/${slug}`} className="data-link">
                  {project.title}
                </Link>
              )
            })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Skills
