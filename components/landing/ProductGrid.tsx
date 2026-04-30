'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

function EmpresaSVG() {
  return (
    <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width="480" height="360" fill="#0F1F3D" />
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => (
        <line key={`h${i}`} x1="0" y1={i * 20} x2="480" y2={i * 20} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(i => (
        <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="360" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <rect x="155" y="60" width="130" height="170" rx="1" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="155" y="60" width="85" height="1" fill="rgba(255,255,255,0.12)" />
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="175" y={100 + i * 20} width={85 - i * 10} height="1.5" fill="rgba(255,255,255,0.18)" rx="1" />
      ))}
      <rect x="230" y="170" width="170" height="120" rx="1" fill="#0a1628" stroke="rgba(29,158,117,0.3)" strokeWidth="1" />
      {[0,1,2,3].map(i => (
        <rect key={i} x="248" y={192 + i * 20} width={60 - i * 8} height="1.5" fill="rgba(29,158,117,0.5)" rx="1" />
      ))}
      <circle cx="340" cy="230" r="14" fill="rgba(29,158,117,0.15)" />
      <path d="M333 230 L338 235 L347 223" stroke="#1D9E75" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GestoriaSVG() {
  return (
    <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width="480" height="360" fill="#0A0A0A" />
      <rect x="80" y="100" width="100" height="130" rx="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <rect x="100" y="125" width="60" height="1" fill="rgba(255,255,255,0.08)" />
      <rect x="100" y="140" width="50" height="1" fill="rgba(255,255,255,0.08)" />
      <rect x="100" y="155" width="55" height="1" fill="rgba(255,255,255,0.08)" />
      <rect x="170" y="70" width="100" height="130" rx="1" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <rect x="190" y="95" width="60" height="1" fill="rgba(255,255,255,0.1)" />
      <rect x="190" y="110" width="50" height="1" fill="rgba(255,255,255,0.1)" />
      <rect x="190" y="125" width="55" height="1" fill="rgba(255,255,255,0.1)" />
      <rect x="260" y="50" width="140" height="180" rx="1" fill="#0f1a0f" stroke="rgba(29,158,117,0.25)" strokeWidth="1" />
      <rect x="280" y="80" width="80" height="1.5" fill="rgba(29,158,117,0.4)" />
      <rect x="280" y="100" width="65" height="1.5" fill="rgba(29,158,117,0.25)" />
      <rect x="280" y="120" width="75" height="1.5" fill="rgba(29,158,117,0.25)" />
      <rect x="280" y="140" width="55" height="1.5" fill="rgba(29,158,117,0.25)" />
      <rect x="280" y="160" width="70" height="1.5" fill="rgba(29,158,117,0.25)" />
      <rect x="50" y="280" width="380" height="0.5" fill="rgba(29,158,117,0.15)" />
    </svg>
  )
}

function WhitelabelSVG() {
  return (
    <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <rect width="480" height="360" fill="#1A1A1A" />
      <rect x="120" y="80" width="240" height="1" fill="rgba(255,255,255,0.06)" />
      <rect x="120" y="280" width="240" height="1" fill="rgba(255,255,255,0.06)" />
      <rect x="120" y="80" width="1" height="200" fill="rgba(255,255,255,0.06)" />
      <rect x="360" y="80" width="1" height="200" fill="rgba(255,255,255,0.06)" />
      <text x="240" y="185" textAnchor="middle" fontFamily="system-ui" fontSize="72" fontWeight="200" fill="rgba(255,255,255,0.07)" letterSpacing="-2">L</text>
      <text x="240" y="185" textAnchor="middle" fontFamily="system-ui" fontSize="72" fontWeight="200" fill="rgba(255,255,255,0.07)" letterSpacing="-2">L</text>
      <rect x="185" y="148" width="110" height="0.5" fill="rgba(255,255,255,0.15)" />
      <rect x="185" y="200" width="110" height="0.5" fill="rgba(255,255,255,0.15)" />
      <circle cx="240" cy="174" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="240" cy="174" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <text x="240" y="182" textAnchor="middle" fontFamily="system-ui" fontSize="22" fontWeight="200" fill="rgba(255,255,255,0.5)" letterSpacing="4">TU</text>
    </svg>
  )
}

const cards = [
  {
    svg: EmpresaSVG,
    badge: 'BÁSICO',
    badgeGreen: false,
    title: 'Empresa',
    subtitle: 'Hasta 20 documentos al mes.',
    link: 'Descubra el plan Empresa',
    href: '#precios',
  },
  {
    svg: GestoriaSVG,
    badge: 'MÁS POPULAR',
    badgeGreen: true,
    title: 'Gestoría',
    subtitle: 'Hasta 50 empresas clientes.',
    link: 'Descubra el plan Gestoría',
    href: '#precios',
  },
  {
    svg: WhitelabelSVG,
    badge: 'PREMIUM',
    badgeGreen: false,
    title: 'White-Label',
    subtitle: 'Tu marca. Tu dominio. Tus clientes.',
    link: 'Descubra el plan White-Label',
    href: '#precios',
  },
]

export function ProductGrid() {
  return (
    <section id="producto" style={{ background: '#FAFAF8' }}>
      <div style={{ padding: '80px 48px 64px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontFamily: 'var(--font-dm-sans, system-ui)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 200,
            color: '#0A0A0A',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            maxWidth: '560px',
          }}
        >
          Su gestión documental,<br />comienza ahora.
        </motion.h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }} className="grid-cols-1 md:grid-cols-3">
        {cards.map(({ svg: SVG, badge, badgeGreen, title, subtitle, link, href }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ borderTop: '1px solid #E0DED8', overflow: 'hidden' }}
          >
            <div
              style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', cursor: 'pointer' }}
              onMouseEnter={e => {
                const img = e.currentTarget.querySelector('svg') as SVGElement | null
                if (img) img.style.transform = 'scale(1.03)'
              }}
              onMouseLeave={e => {
                const img = e.currentTarget.querySelector('svg') as SVGElement | null
                if (img) img.style.transform = 'scale(1)'
              }}
            >
              <div style={{ position: 'absolute', inset: 0 }}>
                <SVG />
              </div>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
            </div>

            <div style={{ padding: '28px 32px 36px', background: '#FAFAF8' }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 300,
                letterSpacing: '0.15em',
                color: badgeGreen ? '#1D9E75' : '#888888',
                marginBottom: '10px',
              }}>
                {badge}
              </p>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 200,
                color: '#0A0A0A',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}>
                {title}
              </h3>
              <p style={{
                fontSize: '13px',
                fontWeight: 300,
                color: '#888888',
                marginBottom: '20px',
                lineHeight: 1.6,
              }}>
                {subtitle}
              </p>
              <Link
                href={href}
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  color: '#0A0A0A',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  paddingBottom: '1px',
                  transition: 'border-color 300ms',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0A0A0A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {link} →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
