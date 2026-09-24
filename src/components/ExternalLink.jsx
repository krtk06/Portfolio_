/**
 * External links open in a new tab and say so to screen readers.
 * Pass `label` for icon-only links; the note is appended to the aria-label.
 */
export default function ExternalLink({ href, className, label, children }) {
  const newTabNote = ' (opens in a new tab)'

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label}${newTabNote}` : undefined}
    >
      {children}
      {label ? null : <span className="visually-hidden">{newTabNote}</span>}
    </a>
  )
}
