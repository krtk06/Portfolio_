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

const DESKTOP = 768

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP
  )
  const [fieldReady, setFieldReady] = useState(false)

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= DESKTOP)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isDesktop) return
    /* The field is the heaviest thing on the page, so it waits until the
       browser reports itself idle after load. The timeout keeps it bounded:
       on a slow connection the load event can land late, and the field
       should still appear rather than never. */
    let idleId
    const arm = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(
          () => setFieldReady(true),
          { timeout: 1500 }
        )
      } else {
        idleId = setTimeout(() => setFieldReady(true), 400)
      }
    }
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })

    return () => {
      window.removeEventListener('load', arm)
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
      else clearTimeout(idleId)
    }
  }, [isDesktop])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <CustomCursor />
      {isHome
        ? (isDesktop && fieldReady
            ? <Suspense fallback={null}><LazyField /></Suspense>
            : null)
        : <ParticleBackground />}
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

/* Kept below its first use so the chunk is only requested when this renders —
   which is what stops phones downloading three.js at all. */
const LazyField = lazy(() => import('./components/ParticleField'))

export default App
