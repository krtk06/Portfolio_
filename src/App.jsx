import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Work from './components/Work'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import CustomCursor from './components/CustomCursor'
import MyWork from './components/MyWork'

function App() {
  return (
    <>
      <CustomCursor />
      <ParticleBackground />
      <div className="hero-fade"></div>
      <div className="hero-fade-top"></div>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Work />
              <Skills />
              <Contact />
            </>
          } />
          <Route path="/my-work" element={<MyWork />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App