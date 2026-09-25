import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleField from './components/ParticleField'
import ParticleBackground from './components/ParticleBackground'
import CustomCursor from './components/CustomCursor'
import ScrollManager from './lib/scroll'
import Home from './pages/Home'
import Work from './pages/Work'
import WorkDetail from './pages/WorkDetail'
import NotFound from './pages/NotFound'

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      {isHome ? <ParticleField /> : <ParticleBackground />}
      <div className="hero-fade"></div>
      <div className="hero-fade-top"></div>
      <Navbar />
      <ScrollManager />
      <main id="main" className="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
