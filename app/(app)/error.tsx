'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-6">
      <div className="rounded-full bg-red-100 p-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Ha ocurrido un error</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Algo ha ido mal al cargar esta sección. Puedes intentarlo de nuevo.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
        <Link
          href="/app/documents"
          className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Ir a documentos
        </Link>
      </div>
    </div>
  )
}
