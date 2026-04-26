import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/whitelabel/theme-context'
import { resolveWhitelabelConfig } from '@/lib/whitelabel/resolver'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''

  const wl = await resolveWhitelabelConfig(hostname)

  if (wl) {
    return {
      title: { default: wl.brand_name, template: `%s | ${wl.brand_name}` },
      description: `Plataforma documental para ${wl.brand_name}`,
      icons: wl.brand_favicon_url ? { icon: wl.brand_favicon_url } : undefined,
      robots: { index: false, follow: false },
    }
  }

  return {
    title: {
      default: 'DocuAI — Inteligencia documental para tu empresa',
      template: '%s | DocuAI',
    },
    description:
      'Sube facturas, contratos y nóminas. DocuAI extrae, clasifica y te permite consultar tus documentos empresariales con inteligencia artificial.',
    keywords: ['facturas', 'documentos', 'inteligencia artificial', 'contabilidad', 'gestión documental', 'pymes'],
    authors: [{ name: 'DocuAI' }],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai.app'),
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      siteName: 'DocuAI',
      title: 'DocuAI — Inteligencia documental para tu empresa',
      description: 'Sube facturas, contratos y nóminas. La IA extrae, clasifica y responde tus preguntas.',
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') ?? headersList.get('host') ?? ''
  const wlConfig = await resolveWhitelabelConfig(hostname)

  return (
    <ClerkProvider>
      <html lang="es" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-background text-foreground">
          <ThemeProvider config={wlConfig}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
