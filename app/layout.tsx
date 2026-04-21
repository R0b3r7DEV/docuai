import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-background text-foreground">{children}</body>
      </html>
    </ClerkProvider>
  )
}
