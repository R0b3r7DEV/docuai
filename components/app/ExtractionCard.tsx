'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, ExternalLink, FileText, Sparkles, ScanText, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { DocumentWithExtraction } from '@/types/database'

interface DocumentDetailResponse {
  document: DocumentWithExtraction & { extraction: import('@/types/database').DocumentExtraction | null }
  signedUrl: string
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
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-medium">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const variant = pct >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : pct >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200'
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium gap-1', variant)}>
      <Sparkles className="h-3 w-3" /> Confianza {pct}%
    </span>
  )
}

function OcrBadge({ confidence }: { confidence: number }) {
  const variant = confidence >= 80
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-amber-100 text-amber-700 border-amber-200'
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium gap-1', variant)}>
      <ScanText className="h-3 w-3" /> Procesado con OCR · Confianza: {Math.round(confidence)}%
    </span>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ExtractionCard({ documentId }: { documentId: string }) {
  const router = useRouter()
  const [data, setData] = useState<DocumentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pollingActive, setPollingActive] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const handleRetry = useCallback(async () => {
    setRetrying(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/retry`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al reintentar')
      // Optimistically flip to processing so the polling UI kicks in
      setData(prev => prev ? { ...prev, document: { ...prev.document, status: 'pending', error_message: null } } : prev)
    } catch {
      // keep error state visible
    } finally {
      setRetrying(false)
    }
  }, [documentId])

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
          if (!interval) interval = setInterval(load, 3000)
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    )
  }

  if (fetchError || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{fetchError ?? 'Documento no encontrado'}</span>
          <Button variant="ghost" size="sm" onClick={() => router.push('/app/documents')}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const { document: doc, signedUrl } = data
  const ext = doc.extraction

  if (doc.status === 'processing' || doc.status === 'pending') {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit -ml-2" onClick={() => router.push('/app/documents')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Documentos
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className={cn('h-8 w-8', pollingActive ? 'animate-spin text-primary' : 'text-muted-foreground')} />
            </div>
            <div>
              <p className="font-semibold text-lg">{doc.filename}</p>
              <p className="text-sm text-muted-foreground mt-1.5">
                {doc.status === 'pending' ? 'En cola — procesará en breve…' : 'Claude está analizando el documento…'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (doc.status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit -ml-2" onClick={() => router.push('/app/documents')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Documentos
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <p className="font-semibold">{doc.filename}</p>
              <p className="text-sm text-muted-foreground mt-1">No se pudieron extraer los datos del documento.</p>
              {doc.error_message && (
                <p className="text-xs text-destructive/70 mt-2 font-mono bg-destructive/5 rounded px-3 py-1.5 max-w-sm mx-auto break-all">
                  {doc.error_message}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              className="gap-2"
            >
              {retrying
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Reintentando…</>
                : <><RefreshCw className="h-3.5 w-3.5" />Reintentar</>
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const amount = ext?.amount != null
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: ext.currency ?? 'EUR' }).format(ext.amount)
    : null
  const uploadDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(doc.created_at))

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit -ml-2" onClick={() => router.push('/app/documents')}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Documentos
      </Button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold break-all">{doc.filename}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ext?.ocr_used && ext.ocr_confidence != null && (
            <OcrBadge confidence={ext.ocr_confidence} />
          )}
          {ext?.confidence_score != null && <ConfidenceBadge score={ext.confidence_score} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metadatos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Nombre"      value={<span className="truncate block">{doc.filename}</span>} />
              <Field label="Tamaño"      value={formatSize(doc.size_bytes)} />
              <Field label="Tipo"        value={<Badge variant="secondary" className="text-xs font-mono">{doc.mime_type}</Badge>} />
              <Field label="Subida"      value={uploadDate} />
            </dl>
            {signedUrl && (
              <a href={signedUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline w-fit">
                <ExternalLink className="h-3.5 w-3.5" /> Ver documento original
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datos extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            {!ext ? (
              <p className="text-sm text-muted-foreground">No hay extracción disponible.</p>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <Field label="Tipo"      value={TYPE_LABELS[ext.type] ?? ext.type} />
                <Field label="Categoría" value={CATEGORY_LABELS[ext.category] ?? ext.category} />
                <Field label="Proveedor" value={ext.vendor} />
                <Field label="Fecha"     value={ext.issue_date} />
                <Field label="Concepto"  value={ext.concept} className="col-span-2" />
                <Field label="Importe"   value={amount ? <span className="text-primary font-semibold">{amount}</span> : null} />
                <Field label="Moneda"    value={ext.currency} />
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {signedUrl && doc.mime_type === 'application/pdf' && (
        <Card className="overflow-hidden" style={{ height: 620 }}>
          <iframe src={signedUrl} className="w-full h-full border-0" title={doc.filename} />
        </Card>
      )}

      {signedUrl && doc.mime_type.startsWith('image/') && (
        <Card className="overflow-hidden">
          <CardContent className="flex justify-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signedUrl} alt={doc.filename} className="max-h-[600px] object-contain rounded-lg" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
