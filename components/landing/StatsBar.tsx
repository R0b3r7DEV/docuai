'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  prefix: string
  label: string
}

const stats: Stat[] = [
  { prefix: '', value: 200, suffix: '+', label: 'Gestorías activas' },
  { prefix: '', value: 50000, suffix: '', label: 'Documentos procesados' },
  { prefix: '', value: 99, suffix: '%', label: 'Tasa de extracción correcta' },
  { prefix: '< ', value: 10, suffix: 's', label: 'Por documento' },
]

function Counter({ value, prefix, suffix, inView }: { value: number; prefix: string; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true
    const start = performance.now()
    const duration = 1600

    const raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(tick)
    })

    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  const display = value >= 1000 ? count.toLocaleString('es-ES') : String(count)

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  )
}

export function StatsBar() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '60px 0',
      }}
      className="grid-cols-2 md:grid-cols-4"
      >
        {stats.map(({ value, prefix, suffix, label }, i) => (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
              borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              gap: '8px',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-dm-sans, system-ui)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 200,
              color: '#FAFAF8',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              <Counter value={value} prefix={prefix} suffix={suffix} inView={inView} />
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 300,
              letterSpacing: '0.04em',
              color: 'rgba(250,250,248,0.4)',
              textAlign: 'center',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
