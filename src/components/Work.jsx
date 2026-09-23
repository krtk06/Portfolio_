import { Link } from 'react-router-dom'

const projects = [
  {
    id: 1,
    image: '/Screenshot 2026-04-20 195908.png',
    category: 'Data Science',
    title: 'Spotify Data Analysis & Recommendation',
    description: 'Processed 110,000+ track records to identify statistical "DNA" of musical genres. Built correlation analysis, genre profiling visuals, and a content-based recommendation engine using Cosine Similarity.',
    tags: ['Python', 'Pandas', 'Scikit-Learn']
  },
  {
    id: 2,
    image: '/Screenshot 2026-04-20 202354.png',
    category: 'Full Stack',
    title: 'Chaty – AI Chat Assistant',
    description: 'Full-stack AI chat app with 10+ React components and real-time text/image interactions. Implemented a credit system with Stripe payments and deployed to Vercel.',
    tags: ['React', 'Gemini API', 'Stripe']
  }
]

function Work() {
  return (
    <section className="section section-work" id="work">
      <div className="section-inner">
        <div className="section-label">Work</div>
        <h2 className="section-heading">
          Selected <span className="thin">Projects</span>
        </h2>
        <div className="work-grid">
          {projects.map((project) => (
            <div key={project.id} className="work-card">
              <div className="work-card-image">
                <img src={project.image} alt={project.title} loading="lazy" />
              </div>
              <div className="work-card-content">
                <div className="work-card-category">{project.category}</div>
                <h3 className="work-card-title">{project.title}</h3>
                <p className="work-card-desc">{project.description}</p>
                <div className="work-card-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="work-cta">
          <Link to="/my-work" className="btn-secondary"><span>My Work</span></Link>
        </div>
      </div>
    </section>
  )
}

export default Work
