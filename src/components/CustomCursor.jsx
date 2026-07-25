import { useEffect, useRef, useState } from 'react'

function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const touchQuery = window.matchMedia('(pointer: coarse)')
    setIsTouch(touchQuery.matches)

    const handlePointerChange = (e) => {
      setIsTouch(e.matches)
    }

    touchQuery.addEventListener('change', handlePointerChange)
    return () => touchQuery.removeEventListener('change', handlePointerChange)
  }, [])

  useEffect(() => {
    if (isTouch) return

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

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    document.addEventListener('mousemove', handleMouseMove)

    const elements = document.querySelectorAll('a, button, .work-card, .skill-card')
    elements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      elements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      <div ref={cursorRef} className={`cursor ${isHovering ? 'hover' : ''}`}></div>
      <div ref={cursorDotRef} className={`cursor-dot ${isHovering ? 'hover' : ''}`}></div>
    </>
  )
}

export default CustomCursor
