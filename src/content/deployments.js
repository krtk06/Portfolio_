// aislop-ignore-file ai-slop/hardcoded-url -- deployment URLs live here by design and every one is overridable via VITE_* variables.
/**
 * Deployment-specific URLs, kept out of the content tables so a preview or
 * staging deploy can override them with VITE_* environment variables.
 *
 * @typedef {Object} Deployments
 * @property {string} site
 * @property {string} chaty
 * @property {string} resumeAnalysis
 */

const env = import.meta.env || {}

/** @type {Deployments} */
export const deployments = {
  site: env.VITE_SITE_URL || 'https://www.krtk.xyz',
  chaty: env.VITE_CHATY_URL || 'https://chaty-krtk.vercel.app/',
  resumeAnalysis:
    env.VITE_RESUME_ANALYSIS_URL || 'https://resume-analysis-ruddy.vercel.app',
}
