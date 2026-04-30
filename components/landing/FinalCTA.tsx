'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const perks = [
  '2 documentos gratis',
  'Cancela cuando quieras',
  'Soporte en español',
]

export function FinalCTA() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(email ? `/sign-up?email=${encodeURIComponent(email)}` : '/sign-up')
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0A0A0A' }}>
      {/* Dot texture */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '640px',
          margin: '0 auto',
          padding: '120px clamp(24px, 6vw, 80px)',
          textAlign: 'center',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-dm-sans, system-ui)',
          fontSize: 'clamp(48px, 8vw, 72px)',
          fontWeight: 200,
          color: '#FAFAF8',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '16px',
        }}>
          Empieza hoy.
        </h2>
        <p style={{
          fontSize: '20px',
          fontWeight: 200,
          color: 'rgba(250,250,248,0.4)',
          marginBottom: '48px',
        }}>
          Sin tarjeta de crédito.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0',
            maxWidth: '480px',
            margin: '0 auto 32px',
          }}
          className="flex-col sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            style={{
              flex: 1,
              fontSize: '13px',
              fontWeight: 300,
              color: '#FAFAF8',
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRight: 'none',
              padding: '14px 20px',
              outline: 'none',
              transition: 'border-color 300ms',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(29,158,117,0.6)'
              e.currentTarget.style.borderRight = 'none'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.borderRight = 'none'
            }}
          />
          <button
            type="submit"
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.12em',
              color: '#0A0A0A',
              background: '#FAFAF8',
              border: 'none',
              padding: '14px 28px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 300ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E8E6E0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FAFAF8')}
          >
            CREAR CUENTA
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {perks.map(p => (
            <span
              key={p}
              style={{
                fontSize: '10px',
                fontWeight: 300,
                letterSpacing: '0.08em',
                color: 'rgba(250,250,248,0.3)',
              }}
            >
              ✓ {p}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
