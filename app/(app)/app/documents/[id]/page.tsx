'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { ExtractionCard } from '@/components/app/ExtractionCard'

interface Props {
  params: Promise<{ id: string }>
}

export default function DocumentDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        router.push('/app/documents')
      } else {
        const body = await res.json().catch(() => ({}))
        alert(body.error ?? 'Error al eliminar el documento')
      }
    } catch {
      alert('Error de red al eliminar el documento')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/app/documents" className="hover:text-foreground transition-colors">
            Documentos
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium">Detalle</span>
        </nav>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {deleting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Trash2 className="h-4 w-4" />}
          Eliminar
        </button>
      </div>

      {/* Extraction card */}
      <ExtractionCard documentId={id} />
    </div>
  )
}
