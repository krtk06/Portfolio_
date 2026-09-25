import { Link } from 'react-router-dom'
import { featuredProjects, projects } from '../content/projects'

function SelectedWork() {
  const liveCount = projects.filter((project) => project.live).length

  return (
    <section className="section section-work" id="work">
      <div className="section-inner">
        <p className="figure-label">Fig. 02 — Selected work</p>
        <div className="work-rows">
          {featuredProjects.map((project, index) => (
            <Link key={project.slug} to={`/work/${project.slug}`} className="work-row">
              <span className="work-row-ix">{String(index + 1).padStart(2, '0')}</span>
              <span className="work-row-name">{project.title}</span>
              <span className="work-row-metric">{project.outcome}</span>
            </Link>
          ))}
        </div>
        <p className="data-caption">
          {featuredProjects.length} featured of {projects.length} projects · {liveCount} live demos · source for all
        </p>
        <p className="work-more">
          <Link to="/work" className="data-link">all five projects →</Link>
        </p>
      </div>
    </section>
  )
}

export default SelectedWork
