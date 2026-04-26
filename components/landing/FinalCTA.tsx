'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const perks = ['2 documentos gratis', 'Sin límite de tiempo', 'Cancela cuando quieras']

export function FinalCTA() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(email ? `/sign-up?email=${encodeURIComponent(email)}` : '/sign-up')
  }

  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.13) 0%, transparent 65%)' }}
      />

      <motion.div
        className="relative max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Empieza hoy mismo,{' '}
          <span style={{ color: '#1D9E75' }}>gratis</span>
        </h2>
        <p
          className="text-white/50 mb-8 text-lg leading-relaxed"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          Sin tarjeta de crédito. Sin configuración compleja. Listo en 2 minutos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            className="flex-1 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(29,158,117,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:-translate-y-px"
            style={{ background: '#1D9E75' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(29,158,117,0.4)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
          >
            Empezar gratis
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {perks.map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#1D9E75' }} />
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
