'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: 'Lexia ha reducido el tiempo que dedicamos a procesar facturas en un 80%. Es increíble lo preciso que es con los datos.',
    author: 'Ana García',
    role: 'CEO de Distribuciones García S.L.',
    initials: 'AG',
  },
  {
    quote: 'Como gestora de 15 empresas, Lexia me ha cambiado la vida. Proceso cientos de documentos al mes sin apenas esfuerzo.',
    author: 'Marta López',
    role: 'Gestora en Asesoría LópezCo',
    initials: 'ML',
  },
  {
    quote: 'El chat con IA es una pasada. Pregunto "¿cuánto gasté en electricidad este trimestre?" y me responde al instante con los datos.',
    author: 'Carlos Ruiz',
    role: 'Gerente, Taller Mecánico Ruiz',
    initials: 'CR',
  },
  {
    quote: 'Llevaba años buscando una solución así. Fácil de usar, rápida y sorprendentemente asequible para pymes como la mía.',
    author: 'Laura Martínez',
    role: 'Directora Financiera, Estudio LM',
    initials: 'LM',
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % testimonials.length), 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id="testimonios"
      className="py-24 px-6"
      style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <div className="relative h-56">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-2xl p-8 flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Quote className="h-5 w-5 mb-3 shrink-0" style={{ color: '#1D9E75' }} />
              <p
                className="text-white/80 text-lg leading-relaxed flex-1"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: 'rgba(29,158,117,0.15)',
                    border: '1px solid rgba(29,158,117,0.25)',
                    color: '#4DF0B8',
                  }}
                >
                  {testimonials[current].initials}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{testimonials[current].author}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '6px',
                background: i === current ? '#1D9E75' : 'rgba(255,255,255,0.2)',
              }}
              aria-label={`Testimonio ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
