/**
 * Skills — four working domains rather than a flat list of tools.
 *
 * Every tool named here appears in one of the showcased projects, and the
 * count is the number of those projects that use it. Domains are ordered by
 * how much of the work each one covers: data first, then machine learning,
 * then software engineering.
 */

export const skillDomains = [
  {
    id: 'data',
    label: 'Data Analysis',
    blurb:
      'Taking a raw table apart until the reason behind the numbers is visible, then saying it in one sentence.',
    tools: [
      { name: 'Python', count: 2 },
      { name: 'Pandas', count: 2 },
      { name: 'NumPy', count: 2 },
      { name: 'Seaborn', count: 1 },
      { name: 'Matplotlib', count: 2 },
      { name: 'SQL', count: 1 },
    ],
    projects: ['uber-cancellation-analysis', 'spotify-genre-recommendation'],
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    blurb:
      'Scoring and recommending from text and audio features, where the model output has to be legible to whoever reads it.',
    tools: [
      { name: 'Python', count: 2 },
      { name: 'scikit-learn', count: 1 },
      { name: 'spaCy', count: 1 },
      { name: 'sentence-transformers', count: 1 },
      { name: 'Pandas', count: 1 },
      { name: 'NumPy', count: 1 },
    ],
    projects: ['spotify-genre-recommendation', 'resume-analyzer'],
  },
  {
    id: 'sde',
    label: 'Software Engineering',
    blurb:
      'Taking a model or an API all the way to a URL people can open, with the billing and deployment handled.',
    tools: [
      { name: 'JavaScript', count: 2 },
      { name: 'React', count: 2 },
      { name: 'Next.js', count: 1 },
      { name: 'Node.js', count: 1 },
      { name: 'FastAPI', count: 2 },
      { name: 'TypeScript', count: 1 },
      { name: 'Vercel', count: 2 },
    ],
    projects: ['chaty-ai-chat-assistant', 'quiz-generator', 'resume-analyzer'],
  },
  {
    id: 'ds',
    label: 'Data Science',
    blurb:
      'The modelling layer between the analysis and the app — feature work, similarity, and the statistics that justify the answer.',
    tools: [
      { name: 'Python', count: 3 },
      { name: 'Pandas', count: 3 },
      { name: 'NumPy', count: 3 },
      { name: 'scikit-learn', count: 2 },
      { name: 'Matplotlib', count: 2 },
      { name: 'Seaborn', count: 1 },
    ],
    projects: [
      'spotify-genre-recommendation',
      'resume-analyzer',
      'uber-cancellation-analysis',
    ],
  },
]
