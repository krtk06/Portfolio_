import { projects } from '../content/projects'
import WorkCard from '../components/WorkCard'
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
        <div className="section-label">Work</div>
        <h1 className="section-heading">
          All <span className="thin">Projects</span>
        </h1>
        <div className="work-grid">
          {projects.map((project) => (
            <WorkCard key={project.slug} project={project} headingLevel={2} />
          ))}
        </div>
      </div>
    </section>
  )
}
