'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Building2 } from 'lucide-react'

const plans = [
  {
    name: 'Trial',
    Icon: Sparkles,
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Para probarlo sin compromiso',
    features: ['2 documentos incluidos', 'Extracción automática IA', 'Chat básico', 'Exportación Excel'],
    cta: 'Empezar gratis',
    href: '/sign-up',
    highlight: false,
    badge: null,
  },
  {
    name: 'Pro',
    Icon: Sparkles,
    priceMonthly: 10,
    priceAnnual: 8,
    description: 'Para pymes y autónomos',
    features: ['20 documentos al mes', 'Todos los tipos de documento', 'Chat IA ilimitado', 'Exportación Excel', 'Soporte por email'],
    cta: 'Suscribirse',
    href: '/sign-up',
    highlight: true,
    badge: 'Más popular',
  },
  {
    name: 'Gestoría',
    Icon: Building2,
    priceMonthly: 49,
    priceAnnual: 39,
    description: 'Para gestorías y contables',
    features: ['Hasta 10 empresas clientes', 'Panel multi-empresa', '200 docs/mes por cliente', 'Invitaciones a clientes', 'Soporte prioritario'],
    cta: 'Empezar',
    href: '/sign-up',
    highlight: false,
    badge: null,
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section
      id="precios"
      className="py-24 px-6"
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-5xl mx-auto">
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
            Precios simples y transparentes
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-8" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            Empieza gratis. Escala cuando lo necesites. Cancela cuando quieras.
          </p>

          {/* Annual/monthly toggle */}
          <div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="text-sm transition-colors"
              style={{ color: !annual ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: !annual ? 500 : 400 }}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(v => !v)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: annual ? '#1D9E75' : 'rgba(255,255,255,0.15)' }}
              aria-checked={annual}
              role="switch"
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: annual ? '22px' : '2px' }}
              />
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="text-sm transition-colors flex items-center gap-1.5"
              style={{ color: annual ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: annual ? 500 : 400 }}
            >
              Anual
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(29,158,117,0.2)', color: '#4DF0B8' }}
              >
                −20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(({ name, Icon, priceMonthly, priceAnnual, description, features, cta, href, highlight, badge }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl p-7 flex flex-col gap-6"
              style={
                highlight
                  ? {
                      background: 'rgba(29,158,117,0.05)',
                      border: '2px solid rgba(29,158,117,0.35)',
                      boxShadow: '0 0 40px rgba(29,158,117,0.08)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
              }
            >
              {badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background: '#1D9E75' }}
                >
                  {badge}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: '#1D9E75' }} />
                  <span className="text-white/65 text-sm font-medium">{name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {annual ? priceAnnual : priceMonthly}€
                  </span>
                  <span className="text-white/38 text-sm">/mes</span>
                </div>
                <p className="text-white/38 text-xs mt-1">{description}</p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#1D9E75' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className="text-center py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-px"
                style={
                  highlight
                    ? { background: '#1D9E75', color: '#fff' }
                    : {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }
                }
              >
                {cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Sin tarjeta de crédito para empezar · Pago seguro con Stripe · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
