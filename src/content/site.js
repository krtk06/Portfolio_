/**
 * Person tokens — the single place person-specific content lives.
 */

export const person = {
  name: 'Kartheek Nistala',
  shortName: 'krtk',
  roleLine: 'Data Scientist / Data Engineer',
  heroLine: 'Data Scientist - Hyderabad, India',
  location: 'Hyderabad, India',
  tagline: 'Concept. Code. Deployment.',
  about: {
    intro:
      'I work across data and product. I start with a raw dataset or a rough idea, work out what it’s actually saying, then build something people can use.',
    groups: [
      {
        label: 'Data',
        items: [
          {
            name: 'Spotify Analysis',
            description:
              'cleans 114,000 rows down to 81,000 unique tracks, compares audio profiles across genres, and recommends similar songs by audio features.',
          },
          {
            name: 'Uber Supply Analysis',
            description:
              'traces why 58% of 6,745 ride requests failed: cancellations on morning city pickups, no cars on evening airport runs.',
          },
        ],
      },
      {
        label: 'Product',
        items: [
          {
            name: 'Retract',
            description:
              'scores any GitHub repository across code quality, security, testing and architecture, then re-checks every claim its agent makes before it counts.',
          },
          {
            name: 'Chatyy',
            description:
              'is a full AI chat app with image generation, document Q&A, credit metering and Stripe payments.',
          },
          {
            name: 'Resume Analysis',
            description:
              'scores a resume against a role or job description and cites the exact line behind each match.',
          },
          {
            name: 'Pothole Reporter',
            description:
              'is a civic platform I worked on that takes citizen reports through verification to public works tenders.',
          },
        ],
      },
    ],
  },
  links: {
    github: 'https://github.com/krtk06',
    linkedin: 'https://linkedin.com/in/kartheek-nistala',
    email: 'krtk2805@gmail.com',
    resume:
      'https://drive.google.com/file/d/1E3u3I_LilBlxm-8IZy3ExRpcIkcTPdMD/view?usp=sharing',
  },
}

export const site = {
  url: 'https://www.krtk.xyz',
  description:
    'Data Scientist / Data Engineer in Hyderabad — 110k+ records analysed across analysis notebooks and deployed AI apps, with case studies, live demos and source code.',
}
