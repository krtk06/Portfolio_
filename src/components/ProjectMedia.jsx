// aislop-ignore-file jsx-a11y/media-has-caption -- captions are burned into every demo video.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function ProjectMedia({ project }) {
  const media = project.media
  const screenshots = media?.screenshots || []
  const screenshotCount = screenshots.length
  const [activeShot, setActiveShot] = useState(null)
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)

  const close = useCallback(() => {
    setActiveShot(null)
    triggerRef.current?.focus()
  }, [])

  const go = useCallback((delta) => {
    setActiveShot((current) => {
      if (current === null || !screenshotCount) return current
      return (current + delta + screenshotCount) % screenshotCount
    })
  }, [screenshotCount])

  useEffect(() => {
    if (activeShot === null) return undefined
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (dialog?.open) dialog.close()
    }
  }, [activeShot, close, go])

  if (!media) return null

  const openShot = (index, event) => {
    triggerRef.current = event.currentTarget
    setActiveShot(index)
  }

  const shot = activeShot === null ? null : screenshots[activeShot]

  return (
    <>
      <section className="work-detail-section work-detail-demo" aria-labelledby="project-demo-heading">
        <div className="work-media-head">
          <h2 id="project-demo-heading">Demo</h2>
          <span className="data-caption">stickman walkthrough</span>
        </div>
        <div className="work-video">
          <video
            controls
            playsInline
            preload="metadata"
            poster={media.poster}
            aria-label={`${project.title} demo video`}
          >
            <source src={media.video} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
        {media.videoDescription && (
          <p className="work-media-note">{media.videoDescription}</p>
        )}
      </section>

      <section className="work-detail-section" aria-labelledby="project-screenshots-heading">
        <div className="work-media-head">
          <h2 id="project-screenshots-heading">Screenshots</h2>
          <span className="data-caption">{screenshotCount} stills</span>
        </div>
        <ul className="work-screenshot-grid">
          {screenshots.map((item, index) => (
            <li key={item.src}>
              <figure className="work-screenshot">
                <button
                  type="button"
                  className="work-screenshot-button"
                  onClick={(event) => openShot(index, event)}
                  aria-label={`Enlarge screenshot: ${item.alt}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
                <figcaption>{item.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {shot && createPortal(
        <dialog
          ref={dialogRef}
          className="work-lightbox"
          aria-label={`Screenshot: ${shot.alt}`}
          onCancel={close}
        >
          <button
            type="button"
            className="work-lightbox-backdrop"
            aria-label="Close screenshot"
            tabIndex={-1}
            onClick={close}
          />
          <button
            ref={closeRef}
            type="button"
            className="work-lightbox-close"
            onClick={close}
          >
            Close
          </button>
          <button
            type="button"
            className="work-lightbox-nav work-lightbox-prev"
            onClick={() => go(-1)}
            aria-label="Previous screenshot"
          >
            ←
          </button>
          <figure className="work-lightbox-figure">
            <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} />
            <figcaption>{shot.caption}</figcaption>
          </figure>
          <button
            type="button"
            className="work-lightbox-nav work-lightbox-next"
            onClick={() => go(1)}
            aria-label="Next screenshot"
          >
            →
          </button>
        </dialog>,
        document.body
      )}
    </>
  )
}

export default ProjectMedia
