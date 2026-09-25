import { Link } from 'react-router-dom'
import { projects } from '../content/projects'
import usePageMeta from '../lib/usePageMeta'

export default function Work() {
  usePageMeta({
    title: 'Work',
    description:
      'Case studies across data analysis, machine learning and full-stack AI work — each with source code, and live demos where they exist.',
    path: '/work',
  })

  return (
    <section className="section section--page">
      <div className="section-inner">
        <p className="figure-label">Fig. 02 — All work</p>
        <div className="work-rows work-rows--detailed">
          {projects.map((project, index) => (
            <Link key={project.slug} to={`/work/${project.slug}`} className="work-row">
              <span className="work-row-ix">{String(index + 1).padStart(2, '0')}</span>
              <span className="work-row-name">{project.title}</span>
              <span className="work-row-cat">{project.category}</span>
              <span className="work-row-metric">{project.outcome}</span>
            </Link>
          ))}
        </div>
        <p className="data-caption">{projects.length} projects · newest pushes on GitHub</p>
      </div>
    </section>
  )
}
