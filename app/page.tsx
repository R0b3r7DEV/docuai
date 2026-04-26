import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { DemoVideo } from '@/components/landing/DemoVideo'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { ScrollProgress } from '@/components/landing/effects/ScrollProgress'
import { GlowCursor } from '@/components/landing/effects/GlowCursor'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/app/dashboard')

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <ScrollProgress />
      <GlowCursor />
      <Navbar />
      <Hero />
      <DemoVideo />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
