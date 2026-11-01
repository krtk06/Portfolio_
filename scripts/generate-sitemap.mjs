/**
 * Writes public/sitemap.xml from the project content so the sitemap cannot
 * drift. Runs automatically before `npm run build` (see package.json).
 */
import { writeFileSync } from 'node:fs'
import { projects } from '../src/content/projects.js'
import { site } from '../src/content/site.js'

const paths = ['/', '/work', ...projects.map((project) => `/work/${project.slug}`)]

const entries = paths
  .map((path) => `  <url><loc>${site.url}${path}</loc></url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`

writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap: ${paths.length} urls written`)
