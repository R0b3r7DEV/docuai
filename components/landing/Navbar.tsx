'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, FileText } from 'lucide-react'

const navLinks = [
  { href: '#caracteristicas', label: 'Características' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#precios', label: 'Precios' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled ? { background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">DocuAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="text-sm text-white/55 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/sign-in" className="text-sm text-white/65 hover:text-white px-4 py-2 transition-colors rounded-lg">
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="text-sm text-white px-5 py-2 rounded-lg font-medium transition-all hover:-translate-y-px"
            style={{ background: '#1D9E75' }}
          >
            Empezar gratis
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden text-white p-2 rounded-lg"
          aria-label="Menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-white/65 hover:text-white text-sm transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Link href="/sign-in" className="text-sm text-white/65 text-center py-2">Iniciar sesión</Link>
                <Link href="/sign-up" className="text-sm text-white text-center py-2.5 rounded-xl font-medium" style={{ background: '#1D9E75' }}>
                  Empezar gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
