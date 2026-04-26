'use client'

import { motion } from 'framer-motion'
import { CloudUpload, Cpu, LineChart } from 'lucide-react'

const steps = [
  {
    Icon: CloudUpload,
    number: '01',
    title: 'Sube tus documentos',
    description: 'Arrastra o selecciona PDF, PNG, JPG o WebP. Soportamos múltiples archivos a la vez, hasta 10 MB cada uno.',
  },
  {
    Icon: Cpu,
    number: '02',
    title: 'La IA lo procesa',
    description: 'Claude AI extrae automáticamente todos los campos: proveedor, importe, fecha, IVA, categoría y más.',
  },
  {
    Icon: LineChart,
    number: '03',
    title: 'Analiza y exporta',
    description: 'Consulta tus datos con el chat IA, explora el dashboard de métricas y exporta a Excel cuando lo necesites.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-24 px-6"
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            ¿Cómo funciona?
          </h2>
          <p className="text-white/50 max-w-md mx-auto" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            En tres pasos tienes tus documentos procesados y listos para analizar.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Connector */}
          <div
            className="hidden md:block absolute"
            style={{
              top: '40px',
              left: 'calc(16.67% + 40px)',
              right: 'calc(16.67% + 40px)',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(29,158,117,0.35), transparent)',
            }}
          />

          {steps.map(({ Icon, number, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-7">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(29,158,117,0.08)',
                    border: '1px solid rgba(29,158,117,0.2)',
                  }}
                >
                  <Icon className="h-9 w-9" style={{ color: '#1D9E75' }} />
                </div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: '#1D9E75' }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/48 text-sm leading-relaxed max-w-xs" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
