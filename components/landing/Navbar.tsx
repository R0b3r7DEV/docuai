'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const navLinks = [
  { href: '#producto', label: 'PRODUCTO' },
  { href: '#precios', label: 'PRECIOS' },
  { href: '#gestorias', label: 'GESTORÍAS' },
  { href: 'mailto:hola@lexia.es', label: 'CONTACTO' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setScrolled(window.scrollY > 60))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const bar = (open: boolean, n: number) => ({
    display: 'block' as const,
    height: '1px',
    background: '#FAFAF8',
    transition: 'transform 400ms cubic-bezier(0.25,0.1,0.25,1), opacity 300ms',
    ...(n === 0 && open ? { transform: 'translateY(6px) rotate(45deg)' } : {}),
    ...(n === 1 && open ? { opacity: 0 } : {}),
    ...(n === 2 && open ? { transform: 'translateY(-6px) rotate(-45deg)' } : {}),
  })

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 600ms cubic-bezier(0.25,0.1,0.25,1), backdrop-filter 600ms',
        ...(scrolled ? { background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)' } : {}),
      }}
    >
      <div style={{
        padding: '0 clamp(24px, 5vw, 64px)',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-dm-sans, system-ui)',
            fontSize: '18px',
            fontWeight: 300,
            letterSpacing: '0.14em',
            color: '#FAFAF8',
          }}>
            LEXIA
          </span>
        </Link>

        <nav className="hidden md:flex" style={{ gap: '40px', alignItems: 'center' }}>
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.12em',
                color: 'rgba(250,250,248,0.6)',
                textDecoration: 'none',
                transition: 'color 300ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,248,0.6)')}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex" style={{ gap: '8px', alignItems: 'center' }}>
          <Link
            href="/sign-in"
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.10em',
              color: '#FAFAF8',
              padding: '10px 20px',
              border: '0.5px solid rgba(250,250,248,0.25)',
              textDecoration: 'none',
              transition: 'border-color 300ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(250,250,248,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(250,250,248,0.25)')}
          >
            ACCEDER
          </Link>
          <Link
            href="/sign-up"
            style={{
              fontSize: '11px',
              fontWeight: 300,
              letterSpacing: '0.10em',
              color: '#FAFAF8',
              padding: '10px 20px',
              background: '#1D9E75',
              textDecoration: 'none',
              transition: 'background 300ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#168c65')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1D9E75')}
          >
            EMPEZAR
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden"
          aria-label="Menú"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', width: '28px' }}
        >
          {[0, 1, 2].map(n => <span key={n} style={bar(menuOpen, n)} />)}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100dvh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden"
            style={{
              background: '#0A0A0A',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '48px',
            }}
          >
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: '28px',
                  fontWeight: 200,
                  letterSpacing: '0.08em',
                  color: 'rgba(250,250,248,0.75)',
                  textDecoration: 'none',
                  transition: 'color 300ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,250,248,0.75)')}
              >
                {label}
              </a>
            ))}
            <Link
              href="/sign-up"
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '0.12em',
                color: '#FAFAF8',
                padding: '14px 48px',
                background: '#1D9E75',
                textDecoration: 'none',
              }}
            >
              EMPEZAR
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
