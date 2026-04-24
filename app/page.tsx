import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  FileText, Zap, MessageSquare, Check, ArrowRight,
  Upload, BarChart3, Shield, Clock, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/app/documents')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">DocuAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#caracteristicas" className="hover:text-foreground transition-colors">Características</a>
            <a href="#precios" className="hover:text-foreground transition-colors">Precios</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">
                Empezar gratis
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-28 px-6">
          {/* gradient orbs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute top-10 left-1/4 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl" />

          <div className="relative max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1 px-3">
              <Sparkles className="h-3 w-3 text-primary" />
              Impulsado por Claude AI
            </Badge>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Inteligencia documental
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                para tu empresa
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Sube facturas, contratos y nóminas. La IA extrae los datos, los clasifica
              y responde cualquier pregunta sobre tus documentos en segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <a href="#precios">Ver precios</a>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {[
                { icon: Shield, text: 'Datos cifrados' },
                { icon: Clock, text: 'Extracción en segundos' },
                { icon: BarChart3, text: 'Exportación Excel' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section id="caracteristicas" className="py-24 px-6 bg-muted/30 border-y">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Todo lo que necesitas para gestionar tus documentos
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Una plataforma completa que convierte documentos en datos accionables.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Upload,
                  color: 'bg-blue-500/10 text-blue-600',
                  title: 'Extracción automática',
                  description: 'Sube PDFs, imágenes o texto. Claude AI extrae automáticamente proveedor, importe, fecha y categoría de cada documento.',
                  items: ['PDF, PNG, JPG, WebP', 'Hasta 10 MB por archivo', 'Múltiples documentos a la vez'],
                },
                {
                  icon: MessageSquare,
                  color: 'bg-violet-500/10 text-violet-600',
                  title: 'Chat inteligente',
                  description: 'Pregunta en lenguaje natural y obtén respuestas precisas basadas en todos tus documentos.',
                  items: ['Respuestas contextuales', 'Historial de conversación', 'Análisis de tendencias'],
                },
                {
                  icon: Zap,
                  color: 'bg-emerald-500/10 text-emerald-600',
                  title: 'Exporta a Excel',
                  description: 'Exporta tus documentos filtrados a Excel con un clic. Ideal para contabilidad y auditorías.',
                  items: ['Filtros avanzados', 'Todos los campos extraídos', 'Descarga instantánea'],
                },
              ].map(({ icon: Icon, color, title, description, items }) => (
                <div
                  key={title}
                  className="group rounded-2xl border bg-card p-7 flex flex-col gap-5 hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                  <ul className="flex flex-col gap-2 mt-auto">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <section id="precios" className="py-24 px-6">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Un plan. Sin sorpresas.</h2>
              <p className="text-muted-foreground">Prueba gratis con 2 documentos. Sin tarjeta de crédito.</p>
            </div>

            <div className="rounded-2xl border-2 border-primary bg-card p-8 flex flex-col gap-6 relative shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="px-3 py-0.5 text-xs font-medium gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Prueba gratis con 2 documentos
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Plan Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">10 €</span>
                  <span className="text-muted-foreground text-sm">/mes</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 text-sm">
                {[
                  'Hasta 20 documentos al mes',
                  'Facturas, presupuestos, nóminas y contratos',
                  'Chat con IA sobre todos tus documentos',
                  'Exportación a Excel ilimitada',
                  'Soporte por email',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Button size="lg" className="w-full h-12 text-base" asChild>
                <Link href="/sign-up">
                  Empezar gratis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Sin tarjeta de crédito para empezar · Pago seguro con Stripe
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-5">
              Empieza a procesar documentos hoy
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Sin tarjeta de crédito. Sin configuración compleja. Listo en minutos.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
              <Link href="/sign-up">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <FileText className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">DocuAI</span>
          </div>
          <span>© {new Date().getFullYear()} DocuAI. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Acceder</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
