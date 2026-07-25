import { Link } from 'react-router-dom'

const allProjects = [
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
  },
  {
    id: 3,
    image: '/Screenshot 2026-04-20 205933.png',
    category: 'Data Analysis',
    title: 'Uber Cancellation Analysis',
    description: 'Analyzed 6,000+ ride records to investigate patterns in driver cancellations and cab unavailability. Identified demand-supply gaps accounted for 70%+ of failed rides.',
    tags: ['Python', 'Pandas', 'Seaborn']
  }
]

function MyWork() {
  return (
    <section className="section" style={{ minHeight: '100vh' }}>
      <div className="section-inner">
        <div className="section-label">My Work</div>
        <h2 className="section-heading">All <span className="thin">Projects</span></h2>
        <div className="work-back">
          <Link to="/" className="btn-secondary">← Back to Home</Link>
        </div>
        <div className="work-grid">
          {allProjects.map((project) => (
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
      </div>
    </section>
  )
}

export default MyWork