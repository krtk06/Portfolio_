/**
 * Projects — the only place project content lives.
 *
 * Every project carries a repo link; `live` is null where nothing is deployed
 * publicly and the Live demo button simply does not render.
 *
 * Descriptions and case-study bodies are derived from the repositories and
 * their READMEs; expand them with the fuller narrative when the material
 * arrives (charts, deeper results).
 */

export const projects = [
  {
    slug: 'spotify-genre-recommendation',
    title: 'Spotify Data Analysis & Recommendation',
    category: 'Data Science',
    description:
      'Processed 110,000+ track records to identify the statistical "DNA" of musical genres — correlation analysis and genre profiling visuals — then built a content-based recommender on the same features.',
    outcome: '110k+ records analysed',
    tags: ['Python', 'Pandas', 'Scikit-Learn'],
    image: '/images/spotify-analysis.webp',
    imageWidth: 1018,
    imageHeight: 483,
    imageAlt: 'Spotify analysis cover with Python, Pandas and scikit-learn logos',
    repo: 'https://github.com/krtk06/Spotify-Analysis',
    live: null,
    featured: true,
    detail: {
      problem: [
        'Genres are usually described by tags and playlists, which say nothing about how the music actually sounds.',
        'The goal was to describe each genre by measurable audio features, then recommend tracks that sit close to a listener’s existing taste.',
      ],
      approach: [
        'Cleaned and de-duplicated 110,000+ track records, then standardised the numeric audio features so distance comparisons were meaningful.',
        'Ran correlation analysis across audio features such as tempo, energy and danceability to find which ones actually separate genres.',
        'Built a content-based recommender using cosine similarity over the scaled feature vectors, with genre profiling visuals alongside it.',
      ],
      results: [
        'A working content-based recommender: given a seed track, it returns the closest tracks in the scaled feature space.',
        'Correlation analysis and genre profiles together show which features carry the genre signal.',
      ],
    },
  },
  {
    slug: 'resume-analyzer',
    title: 'Resume Analyzer',
    category: 'Machine Learning',
    description:
      'AI-powered resume analysis: upload a PDF or DOCX, pick a target role, and get a match score out of 10 with alternative role suggestions and concrete improvement areas.',
    outcome: 'Match scoring out of 10 • live demo',
    tags: ['Python', 'FastAPI', 'spaCy', 'React'],
    image: '/images/resume-analyzer.webp',
    imageWidth: 1280,
    imageHeight: 640,
    imageAlt: 'Resume Analyzer cover with Python, FastAPI, spaCy and React',
    repo: 'https://github.com/krtk06/ResumeAnalysis',
    live: 'https://resume-analysis-ruddy.vercel.app',
    featured: true,
    detail: {
      problem: [
        'Job seekers cannot easily tell how well a resume matches a specific role, or which parts of it are holding the application back.',
      ],
      approach: [
        'Built the backend in FastAPI with spaCy and sentence-transformers to extract skills, education and years of experience.',
        'Scored resumes out of 10 by combining semantic similarity with keyword matching against the target role.',
        'Added alternative role suggestions and per-section improvement areas, with a React front end and drag-and-drop upload.',
      ],
      results: [
        'Live at resume-analysis-ruddy.vercel.app: uploads a PDF or DOCX and returns a scored result with improvement areas.',
      ],
    },
  },
  {
    slug: 'chaty-ai-chat-assistant',
    title: 'Chaty — AI Chat Assistant',
    category: 'Full Stack',
    description:
      'Full-stack AI chat app with 10+ React components and real-time text and image interactions. Implemented a credit system with Stripe payments and deployed the whole thing to Vercel.',
    outcome: '10+ components • live on Vercel',
    tags: ['React', 'Gemini API', 'Stripe'],
    image: '/images/chaty-assistant.webp',
    imageWidth: 1280,
    imageHeight: 600,
    imageAlt: 'Chaty cover with React, JavaScript and Stripe logos',
    repo: 'https://github.com/krtk06/Chaty',
    live: 'https://chaty-krtk.vercel.app/',
    featured: true,
    detail: {
      problem: [
        'A chat product rather than a demo: text and image prompts, metered usage, and a payment path that actually works.',
      ],
      approach: [
        'Composed the interface from 10+ focused React components covering the message thread, input, streaming states and image previews.',
        'Metered usage with a credit system and wired payments through Stripe.',
        'Deployed to Vercel.',
      ],
      results: [
        'Handles real-time text and image interactions end to end.',
        'Usage is metered and payable through Stripe.',
      ],
    },
  },
  {
    slug: 'uber-cancellation-analysis',
    title: 'Uber Cancellation Analysis',
    category: 'Data Analysis',
    description:
      'Analyzed 6,000+ ride records to investigate patterns in driver cancellations and cab unavailability. Identified demand-supply gaps that accounted for 70%+ of failed rides.',
    outcome: '70%+ of failed rides explained',
    tags: ['Python', 'Pandas', 'Seaborn'],
    image: '/images/uber-analysis.webp',
    imageWidth: 1280,
    imageHeight: 616,
    imageAlt: 'Uber cancellation analysis cover with Python, Pandas and Seaborn logos',
    repo: 'https://github.com/krtk06/Uber-Analysis',
    live: null,
    featured: false,
    detail: {
      problem: [
        'Rides fail for two different reasons: driver cancellations and genuine cab unavailability. The goal was to measure each and see where they overlap.',
      ],
      approach: [
        'Segmented 6,000+ ride records by cancellation reason, time of day and pickup zone.',
        'Compared demand against available supply to isolate the gaps behind failed bookings.',
        'Visualised the breakdown so the operational pattern is readable in one view.',
      ],
      results: [
        'Demand-supply gaps accounted for 70%+ of failed rides.',
      ],
    },
  },
  {
    slug: 'codetrack-pro',
    title: 'CodeTrack Pro',
    category: 'Full Stack',
    description:
      'Dashboard that pulls LeetCode, Codeforces and GitHub activity into one view: topic strengths, daily streaks, contest trends, mock interviews and job applications.',
    outcome: 'Three platforms unified in one dashboard',
    tags: ['TypeScript', 'React', 'Prisma', 'Docker'],
    image: '/images/codetrack.webp',
    imageWidth: 1280,
    imageHeight: 640,
    imageAlt: 'CodeTrack Pro cover with TypeScript, React, Prisma and Docker',
    repo: 'https://github.com/krtk06/codetrack',
    live: null,
    featured: false,
    detail: {
      problem: [
        'Interview prep is fragmented: problems on LeetCode, contests on Codeforces, code on GitHub and applications in a spreadsheet — so the real patterns stay hidden.',
      ],
      approach: [
        'Connected LeetCode, Codeforces and GitHub (with manual CodeChef import) into a single dashboard.',
        'Surfaced topic-level strengths, daily streaks and contest trends, with mock-interview and job-application tracking alongside.',
        'Built as a TypeScript monorepo: React front end with charts, a Prisma-backed API, and Docker for local services.',
      ],
      results: [
        'One dashboard replacing the spreadsheet; the full product spec ships in the repository as CodeTrack-Pro-PRD.md.',
      ],
    },
  },
]

export const featuredProjects = projects.filter((project) => project.featured)

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}
