'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface FullBleedSectionProps {
  image: React.ReactNode
  imagePosition: 'left' | 'right'
  badge: string
  title: string
  description: string
  cta: string
  ctaHref: string
  dark: boolean
}

export function FullBleedSection({ image, imagePosition, badge, title, description, cta, ctaHref, dark }: FullBleedSectionProps) {
  const bg = dark ? '#111111' : '#FAFAF8'
  const textColor = dark ? '#FAFAF8' : '#0A0A0A'
  const subtitleColor = dark ? 'rgba(250,250,248,0.55)' : '#888888'
  const badgeColor = '#1D9E75'

  const textSide = (
    <motion.div
      initial={{ opacity: 0, x: imagePosition === 'right' ? -32 : 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(48px, 8vw, 96px)',
        background: bg,
      }}
    >
      <div style={{ maxWidth: '460px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 300,
          letterSpacing: '0.15em',
          color: badgeColor,
          marginBottom: '24px',
        }}>
          {badge}
        </p>
        <h2 style={{
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 200,
          color: textColor,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          marginBottom: '24px',
          whiteSpace: 'pre-line',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '15px',
          fontWeight: 300,
          color: subtitleColor,
          lineHeight: 1.8,
          marginBottom: '40px',
          whiteSpace: 'pre-line',
        }}>
          {description}
        </p>
        <Link
          href={ctaHref}
          style={{
            fontSize: '11px',
            fontWeight: 300,
            letterSpacing: '0.12em',
            color: textColor,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: `1px solid ${dark ? 'rgba(250,250,248,0.3)' : 'rgba(10,10,10,0.3)'}`,
            paddingBottom: '4px',
            transition: 'border-color 300ms, gap 300ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = dark ? '#FAFAF8' : '#0A0A0A';
            e.currentTarget.style.gap = '14px'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = dark ? 'rgba(250,250,248,0.3)' : 'rgba(10,10,10,0.3)';
            e.currentTarget.style.gap = '8px'
          }}
        >
          {cta} →
        </Link>
      </div>
    </motion.div>
  )

  const imageSide = (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ flex: 1, position: 'relative', minHeight: '480px', overflow: 'hidden' }}
    >
      {image}
    </motion.div>
  )

  return (
    <section style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '70vh',
    }}
    className="flex-col md:flex-row"
    >
      {imagePosition === 'left' ? (
        <>
          {imageSide}
          {textSide}
        </>
      ) : (
        <>
          {textSide}
          {imageSide}
        </>
      )}
    </section>
  )
}
