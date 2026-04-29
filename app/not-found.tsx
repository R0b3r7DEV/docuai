import Link from 'next/link'
import { FileText } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 gap-10">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
          <FileText className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-lg">Lexia</span>
      </Link>

      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <p className="text-8xl font-bold text-muted-foreground/20 leading-none">404</p>
        <div>
          <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
          <p className="text-muted-foreground text-sm">
            La página que buscas no existe o ha sido eliminada.
          </p>
        </div>
        <div className="flex gap-3 mt-1">
          <Link
            href="/app/dashboard"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
