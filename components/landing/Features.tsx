'use client'

import { motion } from 'framer-motion'
import { Upload, MessageSquare, Zap, ScanText, BarChart3, Building2 } from 'lucide-react'

const features = [
  {
    Icon: Upload,
    color: '#1D9E75',
    title: 'Extracción automática',
    description: 'Sube PDFs, PNG o JPG. Claude AI extrae proveedor, importe, fecha, IVA y categoría en segundos.',
  },
  {
    Icon: MessageSquare,
    color: '#6366F1',
    title: 'Chat con IA',
    description: 'Pregunta en lenguaje natural y obtén respuestas precisas basadas en todos tus documentos.',
  },
  {
    Icon: Zap,
    color: '#F59E0B',
    title: 'Exportación Excel',
    description: 'Exporta documentos filtrados a Excel con un clic. Perfecto para contabilidad y auditorías.',
  },
  {
    Icon: ScanText,
    color: '#EC4899',
    title: 'OCR inteligente',
    description: 'Procesa facturas escaneadas de baja calidad con OCR avanzado y preprocesado de imagen.',
  },
  {
    Icon: BarChart3,
    color: '#3B82F6',
    title: 'Dashboard de métricas',
    description: 'Visualiza gastos mensuales, proveedores top y tendencias con gráficos interactivos en tiempo real.',
  },
  {
    Icon: Building2,
    color: '#10B981',
    title: 'Modo gestoría',
    description: 'Gestiona múltiples empresas clientes desde un único panel de control. Perfecto para contables.',
  },
]

export function Features() {
  return (
    <section
      id="caracteristicas"
      className="py-24 px-6"
      style={{ background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-6xl mx-auto">
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
            Todo lo que necesitas
          </h2>
          <p className="text-white/50 max-w-xl mx-auto" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Una plataforma completa que convierte documentos en datos accionables para tu negocio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map(({ Icon, color, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl p-6 transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = `${color}30`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.025)'
                el.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/48 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
