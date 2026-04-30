'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PLAN_PRICES } from '@/lib/stripe/constants'

const plans = [
  {
    key: 'empresa',
    badge: null,
    highlight: false,
    name: 'Empresa',
    priceMonthly: PLAN_PRICES.pro,
    features: [
      'Hasta 20 documentos/mes',
      'Chat ilimitado con IA',
      'Exportación Excel',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    href: '/sign-up',
  },
  {
    key: 'gestoria',
    badge: 'MÁS POPULAR',
    highlight: true,
    name: 'Gestoría',
    priceMonthly: PLAN_PRICES.gestoria,
    features: [
      'Hasta 50 empresas clientes',
      '20 documentos/mes por cliente',
      'Panel multi-empresa',
      'Invitaciones automáticas',
      'Resúmenes mensuales',
    ],
    cta: 'Hablar con ventas',
    href: '/sign-up',
  },
  {
    key: 'whitelabel',
    badge: null,
    highlight: false,
    name: 'White-Label',
    priceMonthly: PLAN_PRICES.whitelabel,
    features: [
      'Tu marca y dominio',
      'Clientes ilimitados',
      'Panel white-label',
      'Soporte prioritario',
    ],
    cta: 'Solicitar demo',
    href: '/sign-up',
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="precios" style={{ background: '#FAFAF8', padding: '96px clamp(24px, 5vw, 80px)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ marginBottom: '64px' }}
      >
        <h2 style={{
          fontFamily: 'var(--font-dm-sans, system-ui)',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: 200,
          color: '#0A0A0A',
          letterSpacing: '-0.01em',
          marginBottom: '40px',
        }}>
          Encuentre su plan.
        </h2>

        {/* Annual toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: !annual ? '#0A0A0A' : '#888888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 300ms',
            }}
          >
            MENSUAL
          </button>
          <button
            onClick={() => setAnnual(v => !v)}
            style={{
              width: '40px',
              height: '20px',
              borderRadius: '10px',
              background: annual ? '#1D9E75' : '#D0CEC8',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 300ms',
            }}
            role="switch"
            aria-checked={annual}
          >
            <span style={{
              position: 'absolute',
              top: '2px',
              left: annual ? '22px' : '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 300ms cubic-bezier(0.25,0.1,0.25,1)',
            }} />
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: annual ? '#0A0A0A' : '#888888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 300ms',
            }}
          >
            ANUAL
            <span style={{
              fontSize: '10px',
              fontWeight: 300,
              letterSpacing: '0.06em',
              color: annual ? '#1D9E75' : '#888888',
              background: annual ? 'rgba(29,158,117,0.1)' : 'rgba(136,136,136,0.1)',
              padding: '2px 8px',
              transition: 'all 300ms',
            }}>
              −20%
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {plans.map(({ key, badge, highlight, name, priceMonthly, features, cta, href }, i) => {
          const price = annual ? Math.round(priceMonthly * 0.8) : priceMonthly

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                border: `0.5px solid ${highlight ? '#1D9E75' : '#E0DED8'}`,
                borderTop: highlight ? '2px solid #1D9E75' : '0.5px solid #E0DED8',
                padding: '40px 36px 44px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                position: 'relative',
              }}
            >
              {badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '36px',
                  fontSize: '10px',
                  fontWeight: 300,
                  letterSpacing: '0.12em',
                  color: '#FAFAF8',
                  background: '#1D9E75',
                  padding: '3px 12px',
                }}>
                  {badge}
                </div>
              )}

              <p style={{
                fontSize: '13px',
                fontWeight: 300,
                letterSpacing: '0.08em',
                color: '#888888',
                marginBottom: '16px',
              }}>
                {name.toUpperCase()}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{
                  fontFamily: 'var(--font-dm-sans, system-ui)',
                  fontSize: '56px',
                  fontWeight: 200,
                  color: '#0A0A0A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {price}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 300, color: '#888888' }}>€ / mes</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '0', flex: 1 }}>
                {features.map((f, fi) => (
                  <li
                    key={f}
                    style={{
                      fontSize: '13px',
                      fontWeight: 300,
                      color: '#0A0A0A',
                      padding: '13px 0',
                      borderBottom: fi < features.length - 1 ? '0.5px solid #E0DED8' : 'none',
                      lineHeight: 1.5,
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 300,
                  letterSpacing: '0.12em',
                  padding: '14px',
                  textDecoration: 'none',
                  transition: 'background 300ms, color 300ms',
                  ...(highlight
                    ? { background: '#1D9E75', color: '#FAFAF8' }
                    : { background: '#0A0A0A', color: '#FAFAF8' }
                  ),
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {cta.toUpperCase()}
              </Link>
            </motion.div>
          )
        })}
      </div>

      <p style={{
        fontSize: '11px',
        fontWeight: 300,
        letterSpacing: '0.06em',
        color: '#888888',
        marginTop: '32px',
        textAlign: 'center',
      }}>
        Sin tarjeta de crédito para empezar · Pago seguro con Stripe · Cancela cuando quieras
      </p>
    </section>
  )
}
