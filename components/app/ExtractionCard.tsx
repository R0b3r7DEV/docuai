'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { DocumentWithExtraction } from '@/types/database'

interface DocumentDetailResponse {
  document: DocumentWithExtraction & { extraction: import('@/types/database').DocumentExtraction | null }
  signedUrl: string
}

interface Props {
  documentId: string
}

const TYPE_LABELS: Record<string, string> = {
  factura: 'Factura', presupuesto: 'Presupuesto', nomina: 'Nómina',
  contrato: 'Contrato', albaran: 'Albarán', extracto_bancario: 'Extracto bancario',
  balance: 'Balance', otro: 'Otro',
}
const CATEGORY_LABELS: Record<string, string> = {
  suministros: 'Suministros', servicios: 'Servicios', personal: 'Personal',
  alquiler: 'Alquiler', material: 'Material', impuestos: 'Impuestos', otro: 'Otro',
}

function Field({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      Confianza {pct}%
    </span>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ExtractionCard({ documentId }: Props) {
  const router = useRouter()
  const [data, setData] = useState<DocumentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pollingActive, setPollingActive] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json: DocumentDetailResponse = await res.json()
        setData(json)

        const status = json.document.status
        if (status === 'pending' || status === 'processing') {
          setPollingActive(true)
          if (!interval) {
            interval = setInterval(load, 3000)
          }
        } else {
          setPollingActive(false)
          if (interval) { clearInterval(interval); interval = null }
        }
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Error al cargar el documento')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { if (interval) clearInterval(interval) }
  }, [documentId])

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando documento…</p>
      </div>
    )
  }

  // ── Fetch error ─────────────────────────────────────────────────────────
  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">{fetchError ?? 'Documento no encontrado'}</p>
        <button
          onClick={() => router.push('/app/documents')}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a documentos
        </button>
      </div>
    )
  }

  const { document: doc, signedUrl } = data
  const ext = doc.extraction

  // ── Processing / pending ─────────────────────────────────────────────────
  if (doc.status === 'processing' || doc.status === 'pending') {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => router.push('/app/documents')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Documentos
        </button>
        <div className="flex flex-col items-center gap-4 rounded-lg border p-12 text-center">
          <Loader2 className={cn('h-10 w-10', pollingActive ? 'animate-spin text-blue-500' : 'text-muted-foreground')} />
          <div>
            <p className="font-semibold">{doc.filename}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {doc.status === 'pending' ? 'En cola — procesará en breve…' : 'Claude está analizando el documento…'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error status ─────────────────────────────────────────────────────────
  if (doc.status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => router.push('/app/documents')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Documentos
        </button>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-semibold">{doc.filename}</p>
            <p className="text-sm text-red-600 mt-1">{doc.error_message ?? 'Error desconocido al procesar el documento'}</p>
          </div>
          <button
            onClick={() => router.push('/app/documents')}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a documentos
          </button>
        </div>
      </div>
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  const amount = ext?.amount != null
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: ext.currency ?? 'EUR' }).format(ext.amount)
    : null

  const uploadDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(doc.created_at))

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => router.push('/app/documents')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Documentos
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-muted-foreground shrink-0" />
          <h2 className="text-xl font-semibold break-all">{doc.filename}</h2>
        </div>
        {ext?.confidence_score != null && (
          <ConfidenceBadge score={ext.confidence_score} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metadata card */}
        <div className="rounded-lg border p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Metadatos</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Nombre"         value={doc.filename} />
            <Field label="Tamaño"         value={formatSize(doc.size_bytes)} />
            <Field label="Tipo MIME"      value={doc.mime_type} />
            <Field label="Fecha de subida" value={uploadDate} />
          </dl>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1 w-fit"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver documento original
            </a>
          )}
        </div>

        {/* Extraction card */}
        <div className="rounded-lg border p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Datos extraídos</h3>
          {!ext ? (
            <p className="text-sm text-muted-foreground">No hay extracción disponible.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Tipo"      value={TYPE_LABELS[ext.type] ?? ext.type} />
              <Field label="Categoría" value={CATEGORY_LABELS[ext.category] ?? ext.category} />
              <Field label="Proveedor" value={ext.vendor} />
              <Field label="Fecha"     value={ext.issue_date} />
              <Field label="Concepto"  value={ext.concept} className="col-span-2" />
              <Field label="Importe"   value={amount} />
              <Field label="Moneda"    value={ext.currency} />
            </dl>
          )}
        </div>
      </div>

      {/* PDF preview */}
      {signedUrl && doc.mime_type === 'application/pdf' && (
        <div className="rounded-lg border overflow-hidden" style={{ height: 600 }}>
          <iframe src={signedUrl} className="w-full h-full" title={doc.filename} />
        </div>
      )}

      {/* Image preview */}
      {signedUrl && doc.mime_type.startsWith('image/') && (
        <div className="rounded-lg border overflow-hidden flex justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signedUrl} alt={doc.filename} className="max-h-[600px] object-contain rounded" />
        </div>
      )}
    </div>
  )
}
