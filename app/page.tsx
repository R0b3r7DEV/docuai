import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { ProductGrid } from '@/components/landing/ProductGrid'
import { StatsBar } from '@/components/landing/StatsBar'
import { FullBleedSection } from '@/components/landing/FullBleedSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'

function ExtractionImage() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" style={{ width: '72%', maxWidth: '340px', opacity: 0.9 }}>
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(29,158,117,0)" />
            <stop offset="50%" stopColor="rgba(29,158,117,0.4)" />
            <stop offset="100%" stopColor="rgba(29,158,117,0)" />
          </linearGradient>
        </defs>
        {/* Document */}
        <rect x="80" y="40" width="260" height="340" rx="1" fill="#111111" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Fold */}
        <path d="M300 40 L340 80 L300 80 Z" fill="#0A0A0A" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Lines */}
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <rect key={i} x="112" y={100 + i * 28} width={i % 3 === 2 ? 100 : 196} height="1.5" fill="rgba(255,255,255,0.1)" rx="1" />
        ))}
        {/* Highlighted extracted fields */}
        <rect x="112" y="100" width="196" height="1.5" fill="rgba(29,158,117,0.7)" rx="1" />
        <rect x="112" y="156" width="130" height="1.5" fill="rgba(29,158,117,0.5)" rx="1" />
        <rect x="112" y="212" width="160" height="1.5" fill="rgba(29,158,117,0.4)" rx="1" />
        {/* Scan line */}
        <rect x="80" y="0" width="260" height="60" fill="url(#scanGrad)" opacity="0.6">
          <animateTransform attributeName="transform" type="translate" values="0,40; 0,320; 0,40" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Data output */}
        <rect x="310" y="120" width="120" height="80" rx="1" fill="#0f1a0f" stroke="rgba(29,158,117,0.3)" strokeWidth="1" />
        {[0,1,2].map(i => (
          <rect key={i} x="320" y={136 + i * 20} width={i === 1 ? 60 : 80} height="1.5" fill="rgba(29,158,117,0.5)" rx="1" />
        ))}
        <circle cx="450" cy="160" r="8" fill="rgba(29,158,117,0.2)" />
        <path d="M446 160 L449 163 L455 156" stroke="#1D9E75" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 60% 50%, rgba(29,158,117,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

function ChatImage() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F0EEE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 480 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '80%', maxWidth: '380px' }}>
        {/* User message */}
        <rect x="160" y="40" width="260" height="60" rx="1" fill="#E8E6E0" />
        <rect x="176" y="58" width="180" height="1.5" fill="rgba(10,10,10,0.3)" rx="1" />
        <rect x="176" y="74" width="120" height="1.5" fill="rgba(10,10,10,0.2)" rx="1" />
        {/* User avatar */}
        <circle cx="142" cy="70" r="10" fill="rgba(10,10,10,0.12)" />
        {/* AI response bubble */}
        <rect x="20" y="140" width="300" height="100" rx="1" fill="#0A0A0A" />
        {[0,1,2,3].map(i => (
          <rect key={i} x="36" y={160 + i * 18} width={i === 3 ? 100 : 260 - i * 20} height="1.5" fill={i === 0 ? 'rgba(29,158,117,0.9)' : 'rgba(255,255,255,0.25)'} rx="1" />
        ))}
        {/* AI badge */}
        <rect x="20" y="120" width="40" height="14" fill="#1D9E75" />
        <rect x="24" y="126" width="32" height="1.5" fill="rgba(255,255,255,0.7)" rx="1" />
        {/* Second user message */}
        <rect x="200" y="280" width="220" height="50" rx="1" fill="#E8E6E0" />
        <rect x="216" y="296" width="160" height="1.5" fill="rgba(10,10,10,0.3)" rx="1" />
        <rect x="216" y="312" width="90" height="1.5" fill="rgba(10,10,10,0.2)" rx="1" />
        {/* Typing indicator */}
        <rect x="20" y="360" width="70" height="28" rx="1" fill="#0A0A0A" opacity="0.7" />
        {[0,1,2].map(i => (
          <circle key={i} cx={36 + i * 16} cy="374" r="3.5" fill="rgba(255,255,255,0.4)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  )
}

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/app/dashboard')

  return (
    <main style={{ background: '#0A0A0A' }}>
      <Navbar />
      <Hero />
      <ProductGrid />
      <StatsBar />
      <FullBleedSection
        image={<ExtractionImage />}
        imagePosition="right"
        badge="EXTRACCIÓN AUTOMÁTICA"
        title={'Sube.\nLa IA hace el resto.'}
        description={'Claude analiza cada documento en segundos.\nExtrae fecha, proveedor, importe y categoría\nsin configuración. Sin plantillas.'}
        cta="Descubra cómo funciona"
        ctaHref="/sign-up"
        dark={true}
      />
      <FullBleedSection
        image={<ChatImage />}
        imagePosition="left"
        badge="CHAT INTELIGENTE"
        title={'¿Cuánto gastamos en luz\neste trimestre?'}
        description={'Pregunta en lenguaje natural.\nLexia cruza todos tus documentos y\nresponde con datos reales al instante.'}
        cta="Ver el chat en acción"
        ctaHref="/sign-up"
        dark={false}
      />
      <TestimonialsSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}
