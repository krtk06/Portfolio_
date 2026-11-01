import { person } from '../content/site'

function About() {
  return (
    <section className="section section-about" id="about">
      <div className="section-inner">
        <h2 className="section-heading">
          How I <span className="thin">work</span>
        </h2>
        <div className="about-body">
          <p>{person.about.intro}</p>
          {person.about.groups.map((group) => (
            <div className="about-group" key={group.label}>
              <h3 className="about-group-label">{group.label}</h3>
              <ul className="about-tools">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}</strong> {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
