import { Link } from 'react-router-dom'
import { featuredProjects } from '../content/projects'
import WorkCard from './WorkCard'

function SelectedWork() {
  return (
    <section className="section section-work" id="work">
      <div className="section-inner">
        <div className="section-label">Work</div>
        <h2 className="section-heading">
          Selected <span className="thin">Projects</span>
        </h2>
        <div className="work-grid">
          {featuredProjects.map((project) => (
            <WorkCard key={project.slug} project={project} />
          ))}
        </div>
        <div className="work-cta">
          <Link to="/work" className="btn-secondary">
            <span>All projects</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SelectedWork
