import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'
import CustomCursor from './components/CustomCursor'
import ScrollManager from './lib/scroll'
import Home from './pages/Home'
import Work from './pages/Work'
import WorkDetail from './pages/WorkDetail'
import NotFound from './pages/NotFound'

/* The three.js field is heavy, so it mounts — and its chunk fetches — only
   once the browser is idle, after the first paint. */
const ParticleField = lazy(() => import('./components/ParticleField'))

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [fieldReady, setFieldReady] = useState(false)

  useEffect(() => {
    const schedule = typeof window.requestIdleCallback === 'function'
      ? (fn) => window.requestIdleCallback(fn, { timeout: 1200 })
      : (fn) => setTimeout(fn, 200)
    const id = schedule(() => setFieldReady(true))
    return () => {
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      {fieldReady && (isHome
        ? <Suspense fallback={null}><ParticleField /></Suspense>
        : <ParticleBackground />)}
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
