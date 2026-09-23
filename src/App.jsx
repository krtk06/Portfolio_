import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import CustomCursor from './components/CustomCursor'
import ScrollManager from './lib/scroll'
import Home from './pages/Home'
import Work from './pages/Work'
import WorkDetail from './pages/WorkDetail'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <CustomCursor />
      <ParticleBackground />
      <div className="hero-fade"></div>
      <div className="hero-fade-top"></div>
      <Navbar />
      <ScrollManager />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
