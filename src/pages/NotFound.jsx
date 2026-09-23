import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section section--page not-found">
      <div className="section-inner">
        <div className="section-label">404</div>
        <h1 className="section-heading">
          Page not <span className="thin">found</span>
        </h1>
        <p className="not-found-text">
          That link does not exist. It may have moved, or it may never have been here.
        </p>
        <Link to="/" className="btn-primary">
          <span>Back home</span>
        </Link>
      </div>
    </section>
  )
}
