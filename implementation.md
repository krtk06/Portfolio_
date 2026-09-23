# implementation.md — Portfolio rebuild plan (ft/redesign)

> The single source of truth for the redesign of krtk06.vercel.app / krtk.xyz.
> Written to be readable by a human and executable phase by phase by an agent.
> Status: in review. Branch: `ft/redesign` (off `main`). Last updated: 2026-09-23.
> Execution: one phase at a time; a review stop at the end of every phase; commits per meaningful step as `feat:` / `fix:` / `update:` / `chore:`.

---

## 0. How to use this document

**This document is the shared contract between the owner and the implementing agent.** After approval it is placed at the repository root as `implementation.md`; both copies are kept in sync (the repo copy is the working copy).

**Working agreement (applies to every phase):**

- **Quality over speed.** Each step is finished properly — verified in a browser and against this document — before moving on. Perfection of the output matters more than pace.
- **One phase at a time.** Every phase in section 5 ends with a stop: finish it, present what changed with evidence, and wait. The next phase starts only when the owner explicitly says "proceed to next phase".
- **Commit every meaningful step**, not just at phase boundaries. Every commit message is: one of `feat`, `fix`, `update`, `chore`, then `:`, then a single-line description.
  - `feat:` a new capability · `fix:` a defect repair · `update:` a change to existing behavior, copy, or design · `chore:` repo hygiene, tooling, docs.
  - Examples: `feat: add per-route metadata hook`, `fix: correct primary button hover state`, `chore: stop tracking dist`.
  - Never include phase or step numbers in a commit message.
- **Ask, never assume.** If a step needs information that is not in this document or not yet supplied (content, links, copy, credentials), stop and ask the owner before proceeding. Never invent facts, links, or numbers, and never ship placeholder copy.
- **Production is sacred.** Phase 8 (merge to `main`, deploy) additionally requires the owner's explicit go-ahead, on top of the normal phase review.
- Never commit `dist/` — Vercel builds from source.
- Keep all site copy and project data in `src/content/`. Components render content; they never hardcode it.
- Update the checkboxes, the Decisions log, and this working agreement here first, then in code.

**Phase structure:** every phase has a goal, tasks (checkboxes), files, acceptance criteria, and a verify step.

## 1. Goal and target scorecard

**The site's job:** show a hiring manager, in under 30 seconds, that Kartheek Nistala does current, real Data Scientist / Data Engineer work — and then let them go as deep as they want (case studies, links, résumé).

**Target:** raise the live site from the reviewed **6.5/10** to **9+**, measured by the same rubric used in the review.

| Area | Now | Target | Measured by |
|---|---|---|---|
| Visual identity | 8.5 | 9 | Hero comps signed off; consistent tokens; no one-off values |
| Typography | 8 | 9 | 3-step scale, no text under 12px, no unloaded font references |
| Color / contrast | 5 | 9 | Every text token verified ≥ 4.5:1 (or ≥ 3:1 if large) |
| Layout / spacing | 5.5 | 9 | Spacing scale tokens; no section taller than its content needs; responsive at 360–1440 |
| Interaction / motion | 6 | 9 | Button hovers correct; reduced-motion honored; cursor guardrails |
| Content / storytelling | 4 | 9.5 | 4+ projects with links and outcomes; about; experience; résumé in nav |
| Accessibility | 3 | 9 | axe clean, full keyboard pass, focus visible everywhere |
| Technical / SEO | 4 | 9 | Meta/OG per route, sitemap, zero broken links, perf budget met |
| Mobile | 6.5 | 9 | Every section usable and intentional at 390px |
| **Overall** | **6.5** | **9+** | Re-scored against this table after launch |

**Definition of done (global gates, checked at Phase 8):**
- Lighthouse (mobile + desktop): Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100.
- No console errors or warnings in production build.
- Every link on the site (internal and external) returns 200 and is meaningful.
- Every project has at least one outcome token (scale / metric / shipped artifact) and a repo or demo link.
- First-load JS ≤ 250 KB gzipped (three.js excluded via lazy chunk); LCP ≤ 2.5 s; CLS ≤ 0.05.
- Keyboard-only pass completes every task; visible focus on every interactive element.
- `prefers-reduced-motion` disables the sphere animation, the cursor, and reveals.

## 2. Current state (verified during the review)

**Production** = `main` @ `dade709` — the "v1" design: single-page dark portfolio, particle constellation background, 18k-particle three.js sphere, custom cursor, one-line tagline.

Verified defects on production (full evidence list in Appendix A):
1. Primary button ("View Work") becomes white-on-white on hover — fill layer paints behind the button background.
2. `/my-work` returns a Vercel 404 on direct load (`main` has no `vercel.json`).
3. Footer is invisible — a fixed gradient overlay paints over it.
4. Navbar's scrolled state never activates — `window.scrollY` stays 0 because the page scrolls on `body`.
5. Favicon `/vite.svg` 404s (file not in the build).
6. No meta description, no Open Graph / Twitter tags, no robots.txt, no sitemap.
7. Contrast failures in five places (10px skill labels ≈ 2.5:1, card descriptions ≈ 3.7:1, etc.).
8. `* { outline: none !important }` removes all keyboard focus indicators.
9. Misleading pointer cursor and cursor-growth on cards that are not clickable.
10. Footer/bundle: 664 KB uncompressed JS; `THREE.Clock` deprecation warning.

**Parked redesign** = tag `archive/ui-redesign` @ `551524e`. Reference only. Decision D1: not used as a base. A few ideas may be re-implemented from scratch where they are standard practice (SPA rewrite config, content-in-files pattern, per-route metadata).

**This branch** = `ft/redesign`, created off `main`. `dist/` is currently tracked in git. `.agents/`, `.commandcode/`, `skills-lock.json` are untracked tooling artifacts.

## 3. Decisions made during the conversation (log)

- **D1 — Direction.** Fresh rebuild on the live look. Keep the dark canvas, Instrument Serif headlines, particle identity. The parked v2 (Trocchi / grid / banner-hero / light theme) is not reused.
- **D2 — Blog.** Dropped for now. No `/blog` route until real write-ups exist.
- **D3 — Content.** The owner has exact repo links, live demo URLs, chart/screenshot material, and additional projects beyond the current three. The plan assumes 4+ projects.
- **D4 — Branching.** All redesign work happens on `ft/redesign`. `ft/ui-redesign` was deleted and archived at tag `archive/ui-redesign`.
- **D5 — Stack.** Keep Vite + React 18 + react-router 6 + plain CSS driven by design tokens. No Tailwind. No new UI dependencies unless a phase justifies one.
- **D6 — Theme.** Dark-only, matching the live look. No light theme for now.
- **D7 — 3D.** Keep the particle sphere as the signature element, but: lazy-loaded chunk, adaptive particle count, device-pixel-ratio cap, pauses when off-screen and under reduced-motion, `THREE.Clock` replaced.
- **D8 — Cursor.** Keep the custom cursor on fine pointers, with guardrails: disabled under reduced-motion, never over form fields, no hover-growth on non-clickable elements (or make those elements clickable).
- **D9 — Build artifacts.** `dist/` stops being tracked; add to `.gitignore` along with tooling dirs.
- **D10 — Deployment.** Merge to `main` only at Phase 8 with owner sign-off. Verify on krtk06.vercel.app and krtk.xyz afterwards.
- **D11 — Canonical domain.** `krtk.xyz`. The current `krtk.xyz → www.krtk.xyz` redirect gets a deliberate resolution in Phase 7 (pick one canonical host; redirect the other).
- **D12 — Execution workflow.** One phase at a time, with an owner review stop after every phase. Commits per meaningful step as `feat: / fix: / update: / chore:` plus a one-line description, with no phase or step numbers in messages. Missing information is raised as a question, never filled in by assumption.
- **Open decisions** (each resolved by asking the owner when its phase arrives): résumé hosting (recommend `/resume.pdf` self-hosted, drop Google Drive), whether to add Geist Mono for data labels, experience content (real entries or hide the section).

## 4. Architecture and technical decisions

**Target repo layout**
```
src/
  components/   Navbar, Hero, ParticleSphere, Background, Work (featured), WorkCard,
                Skills, About, Experience, Contact, Footer, CustomCursor, ui/ (Button, Tag, Reveal)
  content/      site.js (person, links, nav), projects.js, skills.js, experience.js
  lib/          usePageMeta.js, scroll.js (ScrollManager), icons.jsx
  pages/        Home.jsx, Work.jsx, WorkDetail.jsx, NotFound.jsx
  styles/       tokens.css, base.css, utilities.css   (index.css imports them)
public/         images/ (project art), resume.pdf, og-image.png, favicon set, robots.txt, sitemap.xml
vercel.json     SPA rewrites + asset cache headers
```

**Routing.** `/` (home), `/work` (all projects), `/work/:slug` (case study), `*` (NotFound). All deep links must load directly — this is why `vercel.json` rewrites are Phase 0, not Phase 3.

**Content model.** Plain JS modules under `src/content/` (no CMS). `projects.js`: slug, title, category, description, outcome, tags, images, repo, live, featured, detail { problem, approach, results }. Empty values hide their UI (never render placeholders).

**Design tokens** (CSS custom properties in `src/styles/tokens.css`). Reference values:

| Token | Value | Notes |
|---|---|---|
| `--bg` | `#020203` | keep |
| `--text` | `#f5f5f5` | headings, primary copy |
| `--text-secondary` | `rgba(255,255,255,0.72)` | ≈ 10:1, body/secondary copy |
| `--text-muted` | `rgba(255,255,255,0.58)` | ≈ 6.8:1, small labels (min size 12px) |
| `--text-faint` | `rgba(255,255,255,0.4)` | ≈ 3.7:1 — decorative and ≥ 24px text only |
| `--line` / `--surface` | `rgba(255,255,255,0.08)` / `rgba(255,255,255,0.03)` | borders, cards |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 | replaces the current 200/300/120 padding |
| Section rhythm | 96–128 desktop, 64–96 mobile | vertical padding |
| Container | max 1200px, 24px gutters (48px ≥ 768px) | one consistent shell |
| Radii | 12 (cards), 100 (pills) | |
| Motion | 150ms (micro), 250ms (hover), 600ms (reveal) | all disabled under reduced-motion |

**Performance budget.** First-load JS ≤ 250 KB gzip; three.js lives in a dynamically imported chunk loaded after first paint; images shipped as WebP with explicit `width`/`height` and `loading="lazy"`; fonts: the two current Google families, preconnect kept.

**Metadata.** A small `usePageMeta()` hook sets title, description, canonical, and OG tags per route (no new dependencies). `index.html` keeps sane defaults. JSON-LD `Person` schema added in Phase 7.

## 5. Phase plan

Every phase ends with a review stop: finish it, present the changes and evidence, and wait for the owner's "proceed to next phase".

### Phase 0 — Foundation and baseline fixes
**Goal:** a clean, deployable baseline with the reviewed defects fixed.

- [ ] `.gitignore`: add `dist/`, `.agents/`, `.commandcode/`, `skills-lock.json`; run `git rm -r --cached dist`.
- [ ] `vercel.json`: SPA rewrite `/(.*) → /index.html`; immutable cache headers for `/assets/*`.
- [ ] Fix defect 1 — button hover: restructure the fill so the label reads in both states (label in a `position:relative; z-index:1` span, or animate `background-color` directly).
- [ ] Fix defect 2 — deep links: with `vercel.json` in place, `/work`-style routes resolve; the old `/my-work` route is replaced in Phase 3.
- [ ] Fix defect 3 — footer visibility: remove the fixed gradient overlay from above the footer (scope the fade to the hero, or raise the footer above it).
- [ ] Fix defect 4 — navbar scrolled state: read the real scroll container (`document.body.scrollTop || window.scrollY`).
- [ ] Fix defect 5 — favicon: generate a favicon set from `avatar.png` (16/32/180px + `site.webmanifest`).
- [ ] Remove dead code: the `.reveal` opacity rules that never run, the `"Inter"` font reference (never loaded), the unused `.contact-email` rules that the component never renders.
- [ ] Replace `THREE.Clock` usage (deprecation warning) with `Timer` or manual elapsed time.
- [ ] Capture before/after screenshots of every fix.

**Files:** `index.html`, `vercel.json`, `.gitignore`, `public/favicon*`, `src/index.css`, `src/components/{Navbar,Hero,Contact,Footer,ParticleSphere}.jsx`
**Verify:** all ten defects from Appendix A re-tested in a browser; `npm run build` clean; screenshots stored.

### Phase 1 — Tokens, type, and spacing system
**Goal:** one token layer every component uses; the contrast policy enforced.

- [ ] Create `src/styles/tokens.css`, `base.css`, `utilities.css`; split `index.css`.
- [ ] Add the color, spacing, radius, and motion tokens from the table in section 4.
- [ ] Global base: `:focus-visible` outline (2px, 2px offset), `::selection`, `scroll-margin-top` for anchors, `prefers-reduced-motion` block, sensible defaults.
- [ ] Typography scale: display `clamp(2.5rem, 6vw, 4.5rem)`, section headings `clamp(1.75rem, 3.5vw, 2.5rem)`, body 1rem/1.7, small 0.875rem, micro 0.75rem minimum — nothing smaller.
- [ ] Refactor every component's hardcoded values to tokens; produce the contrast table (token → ratio) as verification evidence.

**Verify:** contrast table; visual regression pass at 1440/390; no `rgba(255,255,255,0.3)`-class values left in components.

### Phase 2 — Hero and identity (hero comps presented for sign-off mid-phase)
**Goal:** the first screen states who you are and what you do, keeping the signature look.

- [ ] Copy: role line ("Data Scientist / Data Engineer — Hyderabad, India") + proof line (strongest scale/metric, e.g. "110k+ records analysed") + keep "Concept. Code. Deployment." as a small eyebrow, not the main message.
- [ ] Produce 3 hero comps as rendered screenshots (typography scale, tagline placement, sphere crop) and present for sign-off before locking.
- [ ] CTAs: "View Work" (primary, hover fixed in Phase 0) and "Download Résumé" (secondary) — résumé moves up from the buried icon.
- [ ] Sphere optimization: dynamic `import()` chunk, adaptive particle count (reduced below 1280px, static single frame under reduced-motion), DPR cap 1.5, pause when off-screen, keep drag interaction.
- [ ] Mobile hero: deliberate treatment without the sphere (tightened scale and spacing; no dead zones).
- [ ] Fix the misleading cursor growth (D8 guardrails).

**Verify:** comps signed off; sphere chunk not in first-load graph; screenshots at 1440/768/390.

### Phase 3 — Work section and case studies
**Goal:** every project is explorable, linked, and proven.

- [ ] `src/content/projects.js` with 4+ projects: slug, category, description, outcome token, tags, repo, live, featured, detail { problem, approach, results }. No placeholders ship.
- [ ] Home: "Selected Projects" grid — 4 featured cards, real imagery (charts/screenshots provided by owner, processed to WebP with dimensions), outcome line visible on the card, tag chips.
- [ ] `/work` index: all projects; simple category grouping; "All projects" entry point from home.
- [ ] `/work/:slug` case study: problem → approach → results, images with captions, repo/live links (hidden when null), prev/next navigation.
- [ ] Cards are real links (fixes the misleading-affordance problem); cards → detail page; links open in new tabs where external.
- [ ] Image pipeline: convert owner-provided material, consistent aspect ratios, alt text.

**Verify:** every direct URL loads (deep-link test); every project has ≥ 1 outcome and ≥ 1 working link; keyboard reachable.

### Phase 4 — Skills, About, Experience, Résumé
**Goal:** the supporting evidence hiring managers scan for.

- [ ] Skills: grouped and data-weighted (Modeling: Python, Pandas, NumPy, scikit-learn, Matplotlib / Data & Infra: SQL, MongoDB, AWS, Docker, Git / Apps: React, Node, JavaScript, TypeScript). Labels ≥ 12px and ≥ 4.5:1.
- [ ] About: 2–3 short paragraphs (what you do, how you work, current focus).
- [ ] Experience: real entries or hidden entirely (owner supplies company/title/dates/bullets, or confirms none).
- [ ] Résumé: self-host `/resume.pdf` (recommended over Google Drive), linked from nav, hero, and contact.
- [ ] Display the email address as text with a copy-to-clipboard button.

**Verify:** content checklist (section 6) fully ticked; nothing placeholder-shaped on the page.

### Phase 5 — Contact, footer, and navigation chrome
**Goal:** the closing sections and the persistent frame.

- [ ] Contact section order: heading → short blurb → primary action → email text → social icons.
- [ ] Footer: visible (defect 3), real content — name, nav links, email, socials, copyright with current year.
- [ ] Navbar: scrolled state working (defect 4), active-section indication, résumé link as text, mobile menu behavior verified (links scroll and close the menu).
- [ ] NotFound page for unknown routes (styled, links home).

**Verify:** nav walkthrough on desktop and mobile; footer visible at both ends of every page; 404 route renders.

### Phase 6 — Accessibility and motion hardening
**Goal:** the accessibility score moves from 3 to 9.

- [ ] Inject axe-core via agent-browser and fix every violation (run on /, /work, /work/:slug, 404).
- [ ] Keyboard pass: skip link, logical order, focus visible on every control, menu operable with Enter/Escape, no focus traps.
- [ ] Contrast re-verification against the Phase 1 table; fix stragglers.
- [ ] Cursor policy (D8) verified; reduced-motion pass (sphere static, no reveals, no cursor).
- [ ] Landmarks and aria: header/nav/main/footer, `aria-current` on active nav item, image alts, external-link cues.

**Verify:** axe report zero violations; keyboard checklist complete; reduced-motion screenshots.

### Phase 7 — Performance and SEO
**Goal:** the technical score moves from 4 to 9.

- [ ] Code-split routes + lazy sphere; verify first-load JS ≤ 250 KB gzip; remove unused CSS.
- [ ] Lighthouse mobile and desktop runs; fix until ≥ 95/100/100/100.
- [ ] Per-route metadata via `usePageMeta()`: title, description, canonical, OG/Twitter; generate a real `og-image.png` (1200×630).
- [ ] `robots.txt`, `sitemap.xml` (all routes), JSON-LD `Person`, `theme-color`.
- [ ] Canonical host decision (D11): pick `krtk.xyz` or `www.krtk.xyz`, configure the redirect, set canonicals accordingly.
- [ ] Cache headers for assets; verify font loading strategy.

**Verify:** Lighthouse reports (both form factors); OG preview check; sitemap lists every project URL.

### Phase 8 — QA and launch (needs the owner's explicit go-ahead to merge)
**Goal:** ship, then prove the new score.

- [ ] Device matrix via agent-browser: 360, 390, 768, 1024, 1440; every route; screenshots archived.
- [ ] Link checker across all internal and external links (repo, demo, résumé, socials).
- [ ] Cross-browser spot check (Chrome, Firefox, Safari/iOS if available).
- [ ] Deploy Vercel preview from `ft/redesign`; owner reviews; fix fallout.
- [ ] Merge to `main`; verify krtk06.vercel.app and krtk.xyz (both domains, redirects, HTTPS).
- [ ] Post-launch smoke test: console clean, network 200s, OG share preview on LinkedIn.
- [ ] Re-score section 1's table against the live site; target 9+ overall.

## 6. Content checklist (owner-provided)

- [ ] Exact repo URL for each project (including the additional projects)
- [ ] Live demo URLs (where they exist)
- [ ] Charts/screenshots from the analyses (raw files fine; they get processed in Phase 3)
- [ ] Résumé PDF
- [ ] Experience and education details — or explicit "hide that section"
- [ ] Canonical domain choice (`krtk.xyz` vs `www.krtk.xyz`)
- [ ] Optional: X/Twitter handle, booking link — omitted if not supplied

## 7. Verification playbook (for the implementing agent)

- Run `npm run dev`; use agent-browser for all visual verification; store screenshots under the session scratchpad in `review/` named by phase.
- Contrast and axe checks: inject axe-core via `agent-browser eval` on each route; keep the JSON output as evidence.
- Link checking: loop every `href` found on each built route; assert HTTP 200 (HEAD) for external links at least once before launch.
- Lighthouse: `npx lighthouse <url> --preset=desktop --output=json` and the mobile default; store both.
- Update this file's checkboxes and the Decisions log as work lands. Commit per meaningful step as `feat: …` / `fix: …` / `update: …` / `chore: …` — one line, no phase or step numbers.

## 8. Risks and open questions

- **Contrast vs mood:** the dim aesthetic is part of the identity; the token table keeps the mood but moves readable text to ≥ 4.5:1. Watch for drift back to low alphas.
- **3D on low-end devices:** mitigated by lazy loading, adaptive counts, DPR cap, reduced-motion static frame. If it still misses the perf budget, fall back to a static rendered image of the sphere.
- **Content timing:** phases 3 and 4 depend on owner-supplied material; sections hide gracefully rather than shipping placeholders.
- **No SSR:** fine for Google, but social previews rely entirely on static OG tags per route — covered in Phase 7.
- **Two domains:** krtk06.vercel.app and krtk.xyz currently serve the same build; Phase 7 makes the canonical explicit.

## Appendix A — Verified defect evidence (from the review)

| # | Defect | Evidence |
|---|---|---|
| 1 | Primary button hover white-on-white | computed styles: `color: rgb(255,255,255)`, `background: rgb(255,255,255)`, fill pseudo at `z-index:-1` |
| 2 | `/my-work` direct load 404 | HTTP 404 text/plain; `vercel.json` absent on `main` |
| 3 | Footer invisible | footer rect y 819–900 under a fixed gradient overlay (z-index 5); sections paint at z-index 10/20 |
| 4 | Navbar scrolled state dead | `window.scrollY = 0` while `body.scrollTop = 3234`; class stayed `nav ` |
| 5 | Favicon 404 | network log: `GET /vite.svg → 404`; file absent from `dist/` |
| 6 | No meta/OG | fetched HTML has no description/og/twitter tags; robots.txt and sitemap.xml 404 |
| 7 | Contrast failures | skill labels ≈ 2.5:1; card descriptions ≈ 3.7:1; hero sub ≈ 4.0:1; section labels ≈ 3.7:1 |
| 8 | No focus indicators | `* { outline: none !important }` in `index.css`, nothing replaces it |
| 9 | Misleading affordances | pointer cursor + cursor growth on `.skill-card` / `.work-card`, neither clickable |
| 10 | Weight and deprecation | 679,700-byte uncompressed JS; `THREE.Clock` deprecation warning in console |

## Appendix B — Parked v2 inventory (reference only, not reused)

Tag `archive/ui-redesign` @ `551524e` contains: Tailwind v4 token system with light/dark themes; focus-visible and reduced-motion handling; content files (site/projects/skills/experience/posts); pages (Home, Work, WorkDetail, Blog, BlogPost, NotFound); components (Hero banner/avatar, SelectedWork, Experience, GithubContributions, TechStack, ChatCTA, Contact, Footer, Navbar, GridPattern, Reveal, RichText, Section, Tag, TechIcon, WorkCard, LiveDemo); `vercel.json`; avatar/banner/og-image assets; placeholder content clearly marked with TODO(placeholder). Kept archived for reference; delete the tag only when this rebuild ships.

---

*Next action after approval: place this file at the repository root as `implementation.md`, then begin Phase 0. Stop at the end of Phase 0 and present the changes for review.*
