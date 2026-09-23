import { useEffect, useRef, useState } from 'react'

function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => setIsActive(!coarsePointer.matches && !reducedMotion.matches)

    update()
    coarsePointer.addEventListener('change', update)
    reducedMotion.addEventListener('change', update)
    return () => {
      coarsePointer.removeEventListener('change', update)
      reducedMotion.removeEventListener('change', update)
    }
  }, [])

  /* The native cursor is only hidden while the custom one is actually rendered. */
  useEffect(() => {
    if (!isActive) return
    document.body.classList.add('has-custom-cursor')
    return () => document.body.classList.remove('has-custom-cursor')
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current

    const handleMouseMove = (e) => {
      if (cursor && cursorDot) {
        cursor.style.left = e.clientX + 'px'
        cursor.style.top = e.clientY + 'px'
        cursorDot.style.left = e.clientX + 'px'
        cursorDot.style.top = e.clientY + 'px'
      }
    }

    /* Grow only over things that are actually clickable. */
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button')) setIsHovering(true)
    }
    const handleMouseOut = (e) => {
      if (e.target.closest('a, button')) setIsHovering(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      <div ref={cursorRef} className={`cursor ${isHovering ? 'hover' : ''}`}></div>
      <div ref={cursorDotRef} className={`cursor-dot ${isHovering ? 'hover' : ''}`}></div>
    </>
  )
}

export default CustomCursor
