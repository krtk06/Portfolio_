/**
 * Projects — the only place project content lives.
 *
 * Every project carries a repo link except Quiz Generator, whose repository is
 * private; `live` is null where nothing is deployed publicly, and either null
 * link simply does not render. The primary button falls back to the repository
 * until a real `live` URL exists.
 *
 * Descriptions and case-study bodies are derived from the repositories and
 * their READMEs; expand them with the fuller narrative when the material
 * arrives (charts, deeper results).
 */

export const projects = [
  {
    slug: 'retract',
    title: 'Retract — Repository Health',
    category: 'Developer Tools',
    description:
      'Point it at any GitHub repository and get back a Repository Health Score with verified, cited findings across code quality, security, testing, documentation, dependencies and architecture. Deterministic analyzers run first; an agent layer then reviews the symbol graph, and a verification step re-checks every claim before it counts toward the score.',
    outcome: 'Score from cited findings',
    tags: ['Python', 'FastAPI', 'Postgres', 'Semgrep'],
    repo: 'https://github.com/krtk06/retract',
    live: null,
    featured: true,
    detail: {
      problem: [
        'Repository health tools either stop at linters or hand over to an LLM that will assert anything. Neither gives a number you can trust or act on.',
      ],
      approach: [
        'Runs deterministic analyzers first — Semgrep, gitleaks, OSV, coverage and complexity — so the facts do not depend on a model.',
        'Indexes each repository into a symbol graph, then runs an agent over that graph and the tool results for deep review, with no vector store or embedding retrieval.',
        'Records every agent claim as an unverified hypothesis and re-checks it in a verification layer before it can publish a finding; high-severity findings wait for a human.',
        'Scores the repository only from verified findings, so the number is defensible rather than plausible.',
      ],
      results: [
        'A Repository Health Score backed by cited findings across six categories: code quality, security, testing, documentation, dependencies and architecture.',
        'Every finding traces back to a deterministic tool or a symbol-graph location, and the agent cannot score or judge a finding on its own.',
      ],
    },
  },
  {
    slug: 'code-refactor',
    title: 'Code Refactor',
    category: 'AI Tooling',
    description:
      'Paste code in one pane and get back the shortest executable form of the same logic — comments and blank lines stripped — streamed token by token into a live editor. A FastAPI + WebSocket backend talks to the model and pushes each chunk straight to the frontend as it arrives.',
    outcome: 'Code in, shorter code out • streamed live',
    tags: ['React', 'FastAPI', 'CodeMirror 6', 'Tailwind'],
    repo: 'https://github.com/krtk06/Code_Refactor',
    live: null,
    featured: false,
    detail: {
      problem: [
        'Tidying up dead comments and verbose lines by hand is slow and easy to get wrong, especially when the refactor has to preserve behaviour exactly.',
      ],
      approach: [
        'Split-screen editor: paste into a CodeMirror 6 pane on the left, refactored output streams into a matching pane on the right.',
        'FastAPI backend validates the request with Pydantic, streams the model response over a WebSocket, and pushes each chunk to the client as it arrives.',
        'Prompt locks the model to raw code output — no prose, no markdown fences — with a hard instruction to preserve functionality exactly.',
        'Vite + React + Tailwind on the front end, dark and distraction-free so the code is the only thing on screen.',
      ],
      results: [
        'A working refactor tool: paste code, hit refactor, and watch the condensed version stream in live.',
        'Output is shorter and cleaner but functionally identical to the input.',
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
    repo: 'https://github.com/krtk06/Uber-Analysis',
    live: null,
    featured: true,
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
    slug: 'spotify-genre-recommendation',
    title: 'Spotify Data Analysis & Recommendation',
    category: 'Data Science',
    description:
      'Processed 110,000+ track records to identify the statistical "DNA" of musical genres — correlation analysis and genre profiling visuals — then built a content-based recommender on the same features.',
    outcome: '110k+ records analysed',
    tags: ['Python', 'Pandas', 'Scikit-Learn'],
    repo: 'https://github.com/krtk06/Spotify-Analysis',
    live: null,
    featured: false,
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
    slug: 'chaty-ai-chat-assistant',
    title: 'Chaty — AI Chat Assistant',
    category: 'Full Stack',
    description:
      'Full-stack AI chat app with 10+ React components and real-time text and image interactions. Implemented a credit system with Stripe payments and deployed the whole thing to Vercel.',
    outcome: '10+ components • live on Vercel',
    tags: ['React', 'Gemini API', 'Stripe'],
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
    slug: 'resume-analyzer',
    title: 'Resume Analyzer',
    category: 'Machine Learning',
    description:
      'AI-powered resume analysis: upload a PDF or DOCX, pick a target role, and get a match score out of 10 with alternative role suggestions and concrete improvement areas.',
    outcome: 'Match scoring out of 10 • live demo',
    tags: ['Python', 'FastAPI', 'spaCy', 'React'],
    repo: 'https://github.com/krtk06/ResumeAnalysis',
    live: 'https://resume-analysis-ruddy.vercel.app',
    featured: false,
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
    slug: 'quiz-generator',
    title: 'Quiz Generator',
    category: 'Full Stack',
    description:
      'AI-powered quiz generation: paste text or upload a .txt, .pdf or .docx file and get a five-question multiple-choice quiz with explanations, generated through the Groq API.',
    outcome: 'Text in, five-question quiz out',
    tags: ['Next.js', 'TypeScript', 'FastAPI', 'Groq API'],
    repo: null,
    live: null,
    featured: false,
    detail: {
      problem: [
        'Turning a document into a usable quiz by hand is slow. The goal: paste text or upload a file and get a multiple-choice quiz back.',
      ],
      approach: [
        'Accepts pasted text (100 characters minimum) or .txt, .pdf and .docx uploads.',
        'Generates five multiple-choice questions with explanations through the Groq API (Llama 3.3 70B).',
        'Next.js 14 front end with a FastAPI backend.',
      ],
      results: [
        'An interactive quiz: answer the generated questions and get results with explanations.',
      ],
    },
  },
]

export const featuredProjects = projects.filter((project) => project.featured)

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}
