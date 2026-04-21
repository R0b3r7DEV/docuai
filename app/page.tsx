import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { FileText, Zap, MessageSquare, Check } from 'lucide-react'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/app/documents')
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-xl tracking-tight">DocuAI</span>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Empezar gratis
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Zap className="h-3 w-3" />
            Extracción de datos con Claude AI
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Inteligencia documental<br />para tu empresa
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Sube facturas, contratos y nóminas. La IA extrae los datos, los clasifica y responde
            cualquier pregunta sobre tus documentos en segundos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Empezar gratis
            </Link>
            <Link
              href="#precios"
              className="rounded-lg border px-8 py-3.5 text-base font-semibold hover:bg-muted transition-colors"
            >
              Ver precios
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-muted/30 border-y">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Todo lo que necesitas para gestionar tus documentos</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-xl border bg-background p-6 flex flex-col gap-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Extracción automática</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sube PDFs, imágenes o texto. Claude AI extrae automáticamente proveedor, importe, fecha
                  y categoría de cada documento.
                </p>
              </div>
              <div className="rounded-xl border bg-background p-6 flex flex-col gap-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Chat inteligente</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pregunta en lenguaje natural: &ldquo;¿Cuánto hemos gastado en suministros este trimestre?&rdquo;
                  y obtén respuestas precisas basadas en tus documentos.
                </p>
              </div>
              <div className="rounded-xl border bg-background p-6 flex flex-col gap-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Exporta a Excel</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Exporta tus documentos filtrados a Excel con un clic. Ideal para contabilidad,
                  auditorías o presentaciones a tu gestor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precios" className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Precios sencillos</h2>
            <p className="text-center text-muted-foreground mb-12">Empieza gratis, escala cuando lo necesites</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Free */}
              <div className="rounded-xl border p-8 flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-semibold">Gratis</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">0 €</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {[
                    '50 documentos al mes',
                    'Chat ilimitado',
                    'Exportación Excel',
                    'PDF, imágenes y texto',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-auto rounded-lg border px-4 py-2.5 text-sm font-medium text-center hover:bg-muted transition-colors"
                >
                  Empezar gratis
                </Link>
              </div>

              {/* Pro */}
              <div className="rounded-xl border-2 border-primary p-8 flex flex-col gap-5 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Más popular
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">29 €</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {[
                    '500 documentos al mes',
                    'Chat ilimitado',
                    'Exportación Excel',
                    'PDF, imágenes y texto',
                    'Soporte prioritario',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="mt-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-center text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Empezar con Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">DocuAI</span>
          <span>© {new Date().getFullYear()} DocuAI. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Acceder</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
