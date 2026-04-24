'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, X, FileText, CloudUpload, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from '@/types/app'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface UploadEntry {
  filename: string
  progress: number
  status: 'waiting' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  limitReached?: boolean
  documentId?: string
  extractedType?: string
}

const TYPE_LABELS: Record<string, string> = {
  factura: 'Factura', presupuesto: 'Presupuesto', nomina: 'Nómina',
  contrato: 'Contrato', albaran: 'Albarán', extracto_bancario: 'Extracto',
  balance: 'Balance', otro: 'Otro',
}

interface Props {
  onUploadComplete?: () => void
}

export function UploadZone({ onUploadComplete }: Props) {
  const [uploads, setUploads] = useState<UploadEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const pollingRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const update = useCallback((filename: string, patch: Partial<UploadEntry>) =>
    setUploads(prev => prev.map(u => u.filename === filename ? { ...u, ...patch } : u)),
  [])

  const stopPolling = useCallback((documentId: string) => {
    if (pollingRefs.current[documentId]) {
      clearInterval(pollingRefs.current[documentId])
      delete pollingRefs.current[documentId]
    }
  }, [])

  useEffect(() => {
    const refs = pollingRefs.current
    return () => { Object.values(refs).forEach(clearInterval) }
  }, [])

  const startPolling = useCallback((filename: string, documentId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`)
        if (!res.ok) return
        const { document } = await res.json()
        if (document.status === 'done') {
          stopPolling(documentId)
          update(filename, { status: 'done', progress: 100, extractedType: document.extraction?.type ?? undefined })
          onUploadComplete?.()
        } else if (document.status === 'error') {
          stopPolling(documentId)
          update(filename, { status: 'error', error: document.error_message ?? 'Error al procesar el documento' })
          onUploadComplete?.()
        }
      } catch { /* transient */ }
    }
    poll()
    pollingRefs.current[documentId] = setInterval(poll, 3000)
  }, [onUploadComplete, stopPolling, update])

  const uploadFile = useCallback(async (file: File) => {
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      setUploads(prev => [...prev.filter(u => u.filename !== file.name), {
        filename: file.name, progress: 0, status: 'error',
        error: 'Tipo no permitido. Usa PDF, imagen o texto plano.',
      }])
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploads(prev => [...prev.filter(u => u.filename !== file.name), {
        filename: file.name, progress: 0, status: 'error',
        error: `Supera el límite de ${MAX_FILE_SIZE_MB} MB`,
      }])
      return
    }

    setUploads(prev => [...prev.filter(u => u.filename !== file.name),
      { filename: file.name, progress: 0, status: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) update(file.name, { progress: Math.round((e.loaded / e.total) * 90) })
      }
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status }))
        xhr.onerror = () => reject(new Error('Error de red al subir el archivo'))
        xhr.open('POST', '/api/documents/upload')
        xhr.send(formData)
      })

      if (response.status === 403) {
        const body = await response.json().catch(() => ({})) as { error?: string; message?: string }
        if (body.error === 'límite_alcanzado') {
          setLimitReached(true)
          update(file.name, { status: 'error', error: body.message ?? 'Límite alcanzado', limitReached: true })
          return
        }
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Error ${response.status} al subir`)
      }
      const { documentId } = await response.json() as { documentId: string }
      update(file.name, { status: 'processing', progress: 100, documentId })
      startPolling(file.name, documentId)
    } catch (err) {
      update(file.name, { status: 'error', error: err instanceof Error ? err.message : 'Error desconocido' })
    }
  }, [update, startPolling])

  const handleFiles = useCallback((files: File[]) => { files.forEach(uploadFile) }, [uploadFile])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files))
  }, [handleFiles])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? [])); e.target.value = ''
  }
  const removeEntry = (filename: string) => {
    setUploads(prev => {
      const entry = prev.find(u => u.filename === filename)
      if (entry?.documentId) stopPolling(entry.documentId)
      return prev.filter(u => u.filename !== filename)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Limit reached overlay */}
      {limitReached ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p className="font-semibold">Límite de documentos alcanzado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Suscríbete para seguir procesando documentos con IA.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/app/upgrade">
              Ver plan Pro <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/40'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
            isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            {isDragging ? <CloudUpload className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">
              {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              PDF · JPEG · PNG · WebP · TXT — Máx. {MAX_FILE_SIZE_MB} MB por archivo
            </p>
          </div>
          <input type="file" className="sr-only" multiple accept={ACCEPTED_MIME_TYPES.join(',')} onChange={handleChange} />
        </label>
      )}

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((u) => (
            <li key={u.filename} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                {u.status === 'uploading'  && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {u.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                {u.status === 'done'       && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                {u.status === 'error'      && <AlertCircle className="h-4 w-4 text-destructive" />}
                {u.status === 'waiting'    && <FileText className="h-4 w-4 text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{u.filename}</p>
                {u.status === 'uploading' && (
                  <div className="mt-1.5"><Progress value={u.progress} className="h-1" /></div>
                )}
                {u.status === 'error' && !u.limitReached && <p className="text-xs text-destructive mt-0.5">{u.error}</p>}
                {u.status === 'error' && u.limitReached && (
                  <p className="text-xs text-destructive mt-0.5">
                    Límite alcanzado ·{' '}
                    <Link href="/app/upgrade" className="underline font-medium">Suscríbete</Link>
                  </p>
                )}
                {u.status === 'processing' && <p className="text-xs text-amber-600 mt-0.5">Procesando con IA…</p>}
                {u.status === 'done' && u.extractedType && (
                  <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1.5">
                    {TYPE_LABELS[u.extractedType] ?? u.extractedType}
                  </Badge>
                )}
                {u.status === 'done' && !u.extractedType && (
                  <p className="text-xs text-emerald-600 mt-0.5">Completado</p>
                )}
              </div>

              {(u.status === 'done' || u.status === 'error') && (
                <button onClick={() => removeEntry(u.filename)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
