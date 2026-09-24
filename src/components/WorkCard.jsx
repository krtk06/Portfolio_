import { Link } from 'react-router-dom'

export default function WorkCard({ project, headingLevel = 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <Link to={`/work/${project.slug}`} className="work-card">
      <div className="work-card-image">
        <img
          src={project.image}
          alt={project.imageAlt}
          width={project.imageWidth}
          height={project.imageHeight}
          loading="lazy"
        />
      </div>
      <div className="work-card-content">
        <div className="work-card-category">{project.category}</div>
        <Heading className="work-card-title">{project.title}</Heading>
        <p className="work-card-outcome">{project.outcome}</p>
        <p className="work-card-desc">{project.description}</p>
        <div className="work-card-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
