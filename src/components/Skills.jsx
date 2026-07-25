import { useEffect } from 'react'

const skills = [
  { name: 'JavaScript', icon: 'JavaScript' },
  { name: 'TypeScript', icon: 'TypeScript' },
  { name: 'HTML5', icon: 'HTML5' },
  { name: 'CSS3', icon: 'CSS3' },
  { name: 'React', icon: 'React' },
  { name: 'Next.js', icon: 'Next.js' },
  { name: 'Tailwind', icon: 'Tailwind-CSS' },
  { name: 'Node.js', icon: 'Node.js' },
  { name: 'Express', icon: 'Express' },
  { name: 'Python', icon: 'Python' },
  { name: 'Pandas', icon: 'Pandas' },
  { name: 'NumPy', icon: 'NumPy' },
  { name: 'Matplotlib', icon: 'Matplotlib' },
  { name: 'MongoDB', icon: 'MongoDB' },
  { name: 'MySQL', icon: 'MySQL' },
  { name: 'R', icon: 'R-' },
  { name: 'Java', icon: 'Java' },
  { name: 'C++', icon: 'C++-(CPlusPlus)' },
  { name: 'Git', icon: 'Git' },
  { name: 'Docker', icon: 'Docker' },
  { name: 'AWS', icon: 'AWS' }
]

const iconUrl = (icon) => `https://icon.icepanel.io/Technology/svg/${encodeURIComponent(icon)}.svg`

function Skills() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="section section-skills" id="skills">
      <div className="section-inner">
        <div className="section-label reveal visible">Skills</div>
        <h2 className="section-heading reveal reveal-delay-1 visible">
          Technical <span className="thin">Skills</span>
        </h2>
        <div className="skills-grid reveal reveal-delay-2 visible">
          {skills.map((skill, index) => (
            <div key={index} className="skill-card">
              <div className="skill-card-logo">
                <img
                  src={iconUrl(skill.icon)}
                  alt={skill.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <span className="skill-card-label">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills