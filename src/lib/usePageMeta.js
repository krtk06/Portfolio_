import { useEffect } from 'react'
import { person, site } from '../content/site'

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/**
 * Per-route title, description, canonical and social metadata.
 * `index: false` marks a page as noindex (used by the 404 route).
 * `enabled: false` leaves the current metadata untouched.
 */
export default function usePageMeta({
  title,
  description,
  path = '/',
  type = 'website',
  index = true,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return

    const fullTitle = title ? `${title} — ${person.name}` : `${person.name} — ${person.roleLine}`
    const text = description || site.description
    const canonical = `${site.url}${path}`
    const image = `${site.url}/og-image.png`

    document.title = fullTitle
    upsertMeta('meta[name="description"]', { name: 'description', content: text })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: index ? 'index, follow' : 'noindex, follow',
    })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: text })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: text,
    })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
    upsertCanonical(canonical)
  }, [title, description, path, type, index, enabled])
}
