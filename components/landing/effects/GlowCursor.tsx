'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function GlowCursor() {
  const mouseX = useMotionValue(-400)
  const mouseY = useMotionValue(-400)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 30 })

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches
    if (isTouchDevice) return

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 200)
      mouseY.set(e.clientY - 200)
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      className="pointer-events-none fixed z-0 w-[400px] h-[400px] rounded-full"
      style={{
        x: springX,
        y: springY,
        background: 'radial-gradient(circle, rgba(29,158,117,0.10) 0%, transparent 70%)',
      }}
    />
  )
}
