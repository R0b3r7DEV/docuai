'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const words1 = ['Tus', 'documentos.']
const words2 = ['Organizados.']

function WordReveal({ words, delay }: { words: string[]; delay: number }) {
  return (
    <span style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: delay + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'inline-block', marginRight: i < words.length - 1 ? '0.28em' : 0 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const bgX = useTransform(mouseX, [-1, 1], [-10, 10])
  const bgY = useTransform(mouseY, [-1, 1], [-7, 7])

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - left) / width - 0.5) * 2)
    mouseY.set(((e.clientY - top) / height - 0.5) * 2)
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        height: '100dvh',
        minHeight: '600px',
        overflow: 'hidden',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '13vh',
      }}
    >
      {/* Parallax background */}
      <motion.div
        style={{ x: bgX, y: bgY, position: 'absolute', inset: '-5%', width: '110%', height: '110%' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>
            <radialGradient id="glow" cx="75%" cy="80%" r="55%">
              <stop offset="0%" stopColor="rgba(29,158,117,0.12)" />
              <stop offset="100%" stopColor="rgba(29,158,117,0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
          <rect width="100%" height="100%" fill="url(#glow)" />
        </svg>
      </motion.div>

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.6) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '0 clamp(24px, 6vw, 80px)',
        maxWidth: '860px',
        width: '100%',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: '11px',
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#1D9E75',
            marginBottom: '28px',
          }}
        >
          GESTIÓN DOCUMENTAL · INTELIGENCIA ARTIFICIAL
        </motion.p>

        <h1 style={{
          fontFamily: 'var(--font-dm-sans, system-ui)',
          fontSize: 'clamp(52px, 9vw, 96px)',
          fontWeight: 200,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: '#FAFAF8',
          marginBottom: '28px',
        }}>
          <WordReveal words={words1} delay={0.3} />
          <br />
          <WordReveal words={words2} delay={0.5} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: '16px',
            fontWeight: 300,
            color: 'rgba(250,250,248,0.5)',
            maxWidth: '440px',
            margin: '0 auto 40px',
            lineHeight: 1.65,
          }}
        >
          La IA lee, clasifica y responde.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            href="/sign-up"
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: '#0A0A0A',
              background: '#FAFAF8',
              padding: '14px 32px',
              textDecoration: 'none',
              transition: 'background 300ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E8E6E0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FAFAF8')}
          >
            DESCUBRIR
          </Link>
          <a
            href="#producto"
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: '#FAFAF8',
              padding: '14px 32px',
              border: '0.5px solid rgba(250,250,248,0.3)',
              textDecoration: 'none',
              transition: 'border-color 300ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,250,248,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,250,248,0.3)')}
          >
            VER DEMO
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 300, letterSpacing: '0.12em', color: 'rgba(250,250,248,0.3)' }}>
          Descubra más
        </span>
        <div style={{ width: '1px', height: '40px', background: 'rgba(250,250,248,0.15)', overflow: 'hidden', position: 'relative' }}>
          <style>{`
            @keyframes scrollLine {
              0% { transform: translateY(-100%); opacity: 1; }
              100% { transform: translateY(100%); opacity: 0; }
            }
          `}</style>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: 'rgba(250,250,248,0.6)',
            animation: 'scrollLine 1.6s cubic-bezier(0.25,0.1,0.25,1) infinite',
          }} />
        </div>
      </motion.div>
    </section>
  )
}
