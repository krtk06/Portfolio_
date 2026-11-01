import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll behaviour across route changes: jump to the hash target when the URL
 * has one, otherwise start the new page at the top.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
