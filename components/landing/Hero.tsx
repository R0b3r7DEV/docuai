'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Clock, BarChart3 } from 'lucide-react'
import { ParticleBackground } from './effects/ParticleBackground'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
}

const trust = [
  { icon: Shield, text: 'Datos cifrados en tránsito y reposo' },
  { icon: Clock, text: 'Extracción en menos de 10 segundos' },
  { icon: BarChart3, text: 'Exportación a Excel con un clic' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" style={{ background: '#0A0A0A' }}>
      <ParticleBackground />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.13) 0%, transparent 65%)' }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center py-24"
      >
        <motion.div variants={item}>
          <span
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-8"
            style={{
              background: 'rgba(29,158,117,0.1)',
              border: '1px solid rgba(29,158,117,0.25)',
              color: '#4DF0B8',
            }}
          >
            <Sparkles className="h-3 w-3" />
            Impulsado por Claude AI de Anthropic
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] mb-6 text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Tu empresa,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #1D9E75 0%, #4DF0B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            más inteligente
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          Sube facturas, contratos y nóminas. DocuAI extrae los datos automáticamente,
          los clasifica y responde cualquier pregunta en segundos.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: '#1D9E75',
              boxShadow: '0 0 0 0 rgba(29,158,117,0)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(29,158,117,0.40)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(29,158,117,0)')}
          >
            Empezar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Ver demo en vídeo
          </a>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-8">
          {trust.map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-white/38">
              <Icon className="h-3.5 w-3.5" style={{ color: '#1D9E75' }} />
              {text}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
