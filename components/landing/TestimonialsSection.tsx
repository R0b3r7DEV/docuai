'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const testimonials = [
  {
    quote: 'En nuestra gestoría procesamos 400 facturas al mes. Antes tardábamos días. Ahora lo hacemos en horas.',
    author: 'MARTA SÁNCHEZ',
    role: 'SOCIA · GESTORÍA SÁNCHEZ & ASOCIADOS',
  },
  {
    quote: 'El chat con IA es lo que más me sorprendió. Pregunto en español y me responde con datos reales de mis documentos.',
    author: 'CARLOS IBÁÑEZ',
    role: 'DIRECTOR FINANCIERO · GRUPO IBÁÑEZ',
  },
  {
    quote: 'Ofrecemos Lexia a nuestros clientes bajo nuestra propia marca. Ha transformado completamente nuestra propuesta de valor.',
    author: 'ANA MOLINA',
    role: 'CEO · CONTAPLUS CONSULTORES',
  },
]

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const current = testimonials[index]

  return (
    <section
      id="testimonios"
      style={{
        background: '#0A0A0A',
        padding: '120px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '760px', width: '100%', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '96px',
          lineHeight: 0.6,
          color: '#1D9E75',
          fontWeight: 200,
          marginBottom: '32px',
          opacity: 0.6,
          userSelect: 'none',
        }}>
          "
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p style={{
              fontFamily: 'var(--font-dm-sans, system-ui)',
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontWeight: 200,
              color: '#FAFAF8',
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
              marginBottom: '40px',
            }}>
              {current.quote}
            </p>
            <p style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: '#FAFAF8',
              marginBottom: '4px',
            }}>
              {current.author}
            </p>
            <p style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: 'rgba(250,250,248,0.4)',
            }}>
              {current.role}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Testimonio ${i + 1}`}
              style={{
                width: i === index ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === index ? '#1D9E75' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 500ms cubic-bezier(0.25,0.1,0.25,1)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
