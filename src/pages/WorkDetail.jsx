import { Link, useParams } from 'react-router-dom'
import { projects, getProject } from '../content/projects'
import NotFound from './NotFound'

export default function WorkDetail() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <NotFound />

  const index = projects.findIndex((item) => item.slug === slug)
  const previous = index > 0 ? projects[index - 1] : null
  const next = index < projects.length - 1 ? projects[index + 1] : null

  return (
    <article className="section section--page work-detail">
      <div className="section-inner">
        <Link to="/work" className="btn-secondary work-detail-back">
          <span>← All projects</span>
        </Link>

        <div className="section-label work-detail-label">{project.category}</div>
        <h1 className="section-heading">{project.title}</h1>
        <p className="work-detail-outcome">{project.outcome}</p>

        <ul className="work-detail-tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        {(project.repo || project.live) && (
          <div className="work-detail-links">
            {project.live && (
              <a
                href={project.live}
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Live demo</span>
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Source code</span>
              </a>
            )}
          </div>
        )}

        <img
          className="work-detail-image"
          src={project.image}
          alt={project.imageAlt}
          width={project.imageWidth}
          height={project.imageHeight}
        />

        <div className="work-detail-body">
          <section className="work-detail-section">
            <h2>Problem</h2>
            {project.detail.problem.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section className="work-detail-section">
            <h2>Approach</h2>
            <ul>
              {project.detail.approach.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="work-detail-section">
            <h2>Results</h2>
            <ul>
              {project.detail.results.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <nav className="work-detail-pager" aria-label="More projects">
          {previous ? (
            <Link to={`/work/${previous.slug}`} className="pager-link">
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/work/${next.slug}`} className="pager-link">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  )
}
