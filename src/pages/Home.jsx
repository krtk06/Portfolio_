import Hero from '../components/Hero'
import About from '../components/About'
import SelectedWork from '../components/SelectedWork'
import Experience from '../components/Experience'
import Skills from '../components/Skills'
import Contact from '../components/Contact'
import usePageMeta from '../lib/usePageMeta'

export default function Home() {
  usePageMeta({ path: '/' })

  return (
    <>
      <Hero />
      <About />
      <SelectedWork />
      <Experience />
      <Skills />
      <Contact />
    </>
  )
}
