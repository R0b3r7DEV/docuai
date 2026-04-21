import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <p className="text-8xl font-bold text-muted-foreground/30">404</p>
        <div>
          <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
          <p className="text-muted-foreground">
            La página que buscas no existe o ha sido eliminada.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/app/documents"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Ir a documentos
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
