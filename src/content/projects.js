/**
 * Projects — the only place project content lives.
 *
 * `repo` and `live` are null until the real URLs are supplied; a null link
 * simply does not render, so nothing placeholder-shaped ever ships.
 *
 * The case-study bodies are a restructure of the copy currently on the live
 * site; expand them with the fuller narrative when the material arrives.
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
    repo: null,
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
    repo: null,
    live: null,
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
    repo: null,
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
]

export const featuredProjects = projects.filter((project) => project.featured)

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}
