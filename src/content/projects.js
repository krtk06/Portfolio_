// aislop-ignore-file code-quality/duplicate-block -- media records repeat the same shape by design.
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

import { deployments } from './deployments.js'

export const projects = [
  {
    slug: 'retract',
    title: 'Retract — Repository Health',
    category: 'Developer Tools',
    description:
      'Point it at any GitHub repository and get back a Repository Health Score with verified, cited findings across code quality, security, testing, documentation, dependencies and architecture. Deterministic analyzers run first; an agent layer then reviews the symbol graph, and a verification step re-checks every claim before it counts toward the score.',
    outcome: 'Score from cited findings',
    media: {
      video: '/media/projects/retract.mp4',
      poster: '/media/projects/retract-poster.webp',
      videoDescription:
        'A 34-second narrated walkthrough of the six-pillar score, deterministic analyzers, symbol-graph review and the verification layer.',
      screenshots: [
        {
          src: '/media/projects/retract-01.webp',
          alt: 'Six-pillar Repository Health Score',
          caption: 'A score across security, code quality, testing, architecture, documentation and dependencies.',
          width: 1062,
          height: 500,
        },
        {
          src: '/media/projects/retract-02.webp',
          alt: 'Cited findings',
          caption: 'Every finding points to a file, a line and the analyzer that produced it.',
          width: 1042,
          height: 500,
        },
        {
          src: '/media/projects/retract-03.webp',
          alt: 'Remediation plan',
          caption: 'A prioritised fix plan showing the points each change would recover.',
          width: 1042,
          height: 490,
        },
        {
          src: '/media/projects/retract-04.webp',
          alt: 'Repository dashboard',
          caption: 'Recent analyses and score trends across repositories.',
          width: 1062,
          height: 600,
        },
      ],
    },
    tags: ['Python', 'FastAPI', 'Postgres', 'Semgrep'],
    repo: 'https://github.com/krtk06/retract',
    live: null,
    film: 'https://github.com/krtk06/retract/releases/download/demo-film/retract-film.mp4',
    filmPoster: 'https://github.com/krtk06/retract/releases/download/demo-film/retract-film-poster.png',
    filmCaptions: 'https://github.com/krtk06/retract/releases/download/demo-film/retract-film.srt',
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
    media: {
      video: '/media/projects/code-refactor.mp4',
      poster: '/media/projects/code-refactor-poster.webp',
      videoDescription:
        'A 31-second walkthrough of the split-pane editor and the streamed refactor response.',
      screenshots: [
        {
          src: '/media/projects/code-refactor-01.webp',
          alt: 'Input code',
          caption: 'Paste code into the left pane and choose the language.',
          width: 1092,
          height: 483,
        },
        {
          src: '/media/projects/code-refactor-02.webp',
          alt: 'Streamed output',
          caption: 'The refactored function streams into the right pane, comments and blank lines removed.',
          width: 1092,
          height: 342,
        },
      ],
    },
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
    media: {
      video: '/media/projects/uber-cancellation-analysis.mp4',
      poster: '/media/projects/uber-poster.webp',
      videoDescription:
        'A 30-second walkthrough of the two failure modes behind more than 70% of failed rides.',
      screenshots: [
        {
          src: '/media/projects/uber-01.webp',
          alt: 'Trip status by time of day',
          caption: 'Completed, cancelled and unavailable rides split across the day.',
          width: 955,
          height: 580,
        },
        {
          src: '/media/projects/uber-02.webp',
          alt: 'Cancellations by pickup point',
          caption: 'City pickups dominate morning cancellations; airport pickups cluster in the evening.',
          width: 946,
          height: 580,
        },
        {
          src: '/media/projects/uber-03.webp',
          alt: 'City-to-airport supply and demand',
          caption: 'Demand peaks in the early morning while supply lags behind.',
          width: 1172,
          height: 843,
        },
        {
          src: '/media/projects/uber-04.webp',
          alt: 'Airport-to-city supply and demand',
          caption: 'Evening demand rises sharply with no matching increase in supply.',
          width: 1172,
          height: 843,
        },
      ],
    },
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
    media: {
      video: '/media/projects/spotify-genre-recommendation.mp4',
      poster: '/media/projects/spotify-poster.webp',
      videoDescription:
        'A 32-second walkthrough of the audio-feature correlations, genre profiles and content-based recommender.',
      screenshots: [
        {
          src: '/media/projects/spotify-01.webp',
          alt: 'Audio feature correlation',
          caption: 'Loudness and energy correlate at 0.76; acoustics moves against both.',
          width: 1172,
          height: 1097,
        },
        {
          src: '/media/projects/spotify-02.webp',
          alt: 'Genre profiles',
          caption: 'Box plots compare the energy and danceability profile of five genres.',
          width: 1172,
          height: 588,
        },
        {
          src: '/media/projects/spotify-03.webp',
          alt: 'Classical vs metal',
          caption: 'A radar view of the audio features that separate the two genres.',
          width: 963,
          height: 823,
        },
      ],
    },
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
    media: {
      video: '/media/projects/chaty-ai-chat-assistant.mp4',
      poster: '/media/projects/chaty-poster.webp',
      videoDescription:
        'A 33-second walkthrough of text, image and document modes, the credit system and the community gallery.',
      screenshots: [
        {
          src: '/media/projects/chaty-01.webp',
          alt: 'Chaty home',
          caption: 'One composer for text and image prompts.',
          width: 1100,
          height: 667,
        },
        {
          src: '/media/projects/chaty-02.webp',
          alt: 'Chat thread',
          caption: 'The full conversation stays in view.',
          width: 1100,
          height: 835,
        },
        {
          src: '/media/projects/chaty-03.webp',
          alt: 'Image generation',
          caption: 'Generated images are hosted and added to the thread.',
          width: 1100,
          height: 835,
        },
        {
          src: '/media/projects/chaty-04.webp',
          alt: 'Document Q&A',
          caption: 'Upload a PDF or document and ask questions about it.',
          width: 1100,
          height: 835,
        },
        {
          src: '/media/projects/chaty-05.webp',
          alt: 'Community gallery',
          caption: 'Published creations from the community.',
          width: 1100,
          height: 610,
        },
      ],
    },
    tags: ['React', 'Gemini API', 'Stripe'],
    repo: 'https://github.com/krtk06/Chaty',
    live: deployments.chaty,
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
    media: {
      video: '/media/projects/resume-analyzer.mp4',
      poster: '/media/projects/resume-poster.webp',
      videoDescription:
        'A 32-second walkthrough of the match score, cited evidence, gaps and alternative roles. The result shown is a sample.',
      screenshots: [
        {
          src: '/media/projects/resume-01.webp',
          alt: 'Match score and rubric',
          caption: 'A sample 7.4/10 match with semantic and requirement-coverage components.',
          width: 1192,
          height: 662,
        },
        {
          src: '/media/projects/resume-02.webp',
          alt: 'Evidence cited from the resume',
          caption: 'Each requirement links to the exact line that supports it.',
          width: 1192,
          height: 670,
        },
        {
          src: '/media/projects/resume-03.webp',
          alt: 'Gaps and next-band actions',
          caption: 'Missing requirements become concrete steps instead of a verdict.',
          width: 1192,
          height: 771,
        },
        {
          src: '/media/projects/resume-04.webp',
          alt: 'Alternative roles',
          caption: 'Semantic similarity suggests roles that may fit better.',
          width: 1192,
          height: 570,
        },
      ],
    },
    tags: ['Python', 'FastAPI', 'spaCy', 'React'],
    repo: 'https://github.com/krtk06/ResumeAnalysis',
    live: deployments.resumeAnalysis,
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
    media: {
      video: '/media/projects/quiz-generator.mp4',
      poster: '/media/projects/quiz-poster.webp',
      videoDescription:
        'A 31-second walkthrough from source text to generated questions, answers and explanations.',
      screenshots: [
        {
          src: '/media/projects/quiz-01.webp',
          alt: 'Quiz input',
          caption: 'Paste text or upload a TXT, PDF or DOCX file.',
          width: 1092,
          height: 966,
        },
        {
          src: '/media/projects/quiz-02.webp',
          alt: 'Generated question',
          caption: 'A multiple-choice question generated from the source material.',
          width: 1192,
          height: 858,
        },
        {
          src: '/media/projects/quiz-03.webp',
          alt: 'Results and explanations',
          caption: 'A score with a verdict and explanation for every question.',
          width: 1192,
          height: 737,
        },
      ],
    },
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
