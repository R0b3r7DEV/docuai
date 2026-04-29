import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist, Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/whitelabel/theme-context'
import { resolveWhitelabelConfig } from '@/lib/whitelabel/resolver'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-dm-mono', display: 'swap', weight: ['300', '400', '500'] })

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
      default: 'Lexia — Inteligencia documental para tu empresa',
      template: '%s | Lexia',
    },
    description:
      'Sube facturas, contratos y nóminas. Lexia extrae, clasifica y te permite consultar tus documentos empresariales con inteligencia artificial.',
    keywords: ['facturas', 'documentos', 'inteligencia artificial', 'contabilidad', 'gestión documental', 'pymes'],
    authors: [{ name: 'Lexia' }],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://lexia.es'),
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      siteName: 'Lexia',
      title: 'Lexia — Inteligencia documental para tu empresa',
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
      <html lang="es" className={`${geist.variable} ${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
        <body className="min-h-full bg-background text-foreground">
          <ThemeProvider config={wlConfig}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
