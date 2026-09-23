import { projects } from '../content/projects'
import WorkCard from '../components/WorkCard'

export default function Work() {
  return (
    <section className="section section--page">
      <div className="section-inner">
        <div className="section-label">Work</div>
        <h1 className="section-heading">
          All <span className="thin">Projects</span>
        </h1>
        <div className="work-grid">
          {projects.map((project) => (
            <WorkCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
