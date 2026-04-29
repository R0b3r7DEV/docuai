'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, FileText } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 gap-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1D9E75' }}>
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Lexia</span>
        </Link>

        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Algo ha ido mal</h1>
            <p className="text-muted-foreground text-sm">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                ref: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button
              onClick={reset}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/"
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
