'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from '@/types/app'

interface UploadEntry {
  filename: string
  progress: number
  status: 'waiting' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  documentId?: string
  extractedType?: string
}

interface Props {
  onUploadComplete?: () => void
}

const TYPE_LABELS: Record<string, string> = {
  factura: 'Factura', presupuesto: 'Presupuesto', nomina: 'Nómina',
  contrato: 'Contrato', albaran: 'Albarán', extracto_bancario: 'Extracto',
  balance: 'Balance', otro: 'Otro',
}

export function UploadZone({ onUploadComplete }: Props) {
  const [uploads, setUploads] = useState<UploadEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
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
          update(filename, {
            status: 'done',
            progress: 100,
            extractedType: document.extraction?.type ?? undefined,
          })
          onUploadComplete?.()
        } else if (document.status === 'error') {
          stopPolling(documentId)
          update(filename, {
            status: 'error',
            error: document.error_message ?? 'Error al procesar el documento',
          })
          onUploadComplete?.()
        }
      } catch {
        // Ignore transient polling errors
      }
    }

    poll() // First check immediately
    pollingRefs.current[documentId] = setInterval(poll, 3000)
  }, [onUploadComplete, stopPolling, update])

  const uploadFile = useCallback(async (file: File) => {
    if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
      setUploads(prev => [...prev.filter(u => u.filename !== file.name), {
        filename: file.name, progress: 0, status: 'error',
        error: `Tipo no permitido. Usa PDF, imagen o texto plano.`,
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

    setUploads(prev => [
      ...prev.filter(u => u.filename !== file.name),
      { filename: file.name, progress: 0, status: 'uploading' },
    ])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          update(file.name, { progress: Math.round((e.loaded / e.total) * 90) })
      }

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status }))
        xhr.onerror = () => reject(new Error('Error de red al subir el archivo'))
        xhr.open('POST', '/api/documents/upload')
        xhr.send(formData)
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${response.status} al subir`)
      }

      const { documentId } = await response.json()
      update(file.name, { status: 'processing', progress: 100, documentId })
      startPolling(file.name, documentId)
    } catch (err) {
      update(file.name, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }, [update, startPolling])

  const handleFiles = useCallback((files: File[]) => {
    files.forEach(uploadFile)
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }, [handleFiles])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
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
      {/* Drop zone */}
      <label
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors',
          isDragging
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className={cn('h-8 w-8 transition-colors', isDragging ? 'text-green-600' : 'text-muted-foreground')} />
        <div className="text-center">
          <p className="font-medium">
            {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF · Imagen · Texto · Máx. {MAX_FILE_SIZE_MB} MB por archivo
          </p>
        </div>
        <input
          type="file"
          className="sr-only"
          multiple
          accept={ACCEPTED_MIME_TYPES.join(',')}
          onChange={handleChange}
        />
      </label>

      {/* Upload list */}
      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((u) => (
            <li key={u.filename} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              {/* Icon */}
              <div className="shrink-0 w-5 flex justify-center">
                {u.status === 'uploading'   && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                {u.status === 'processing'  && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                {u.status === 'done'        && <CheckCircle className="h-4 w-4 text-green-600" />}
                {u.status === 'error'       && <AlertCircle className="h-4 w-4 text-red-500" />}
                {u.status === 'waiting'     && <FileText className="h-4 w-4 text-muted-foreground" />}
              </div>

              {/* Name + sub-info */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium leading-tight">{u.filename}</p>
                {u.status === 'error' && (
                  <p className="text-xs text-red-600 mt-0.5">{u.error}</p>
                )}
                {u.status === 'uploading' && (
                  <p className="text-xs text-muted-foreground mt-0.5">Subiendo… {u.progress}%</p>
                )}
                {u.status === 'processing' && (
                  <p className="text-xs text-amber-600 mt-0.5">Procesando con IA…</p>
                )}
                {u.status === 'done' && u.extractedType && (
                  <span className="inline-block mt-0.5 text-xs rounded-full bg-green-100 text-green-800 px-2 py-0.5 font-medium">
                    {TYPE_LABELS[u.extractedType] ?? u.extractedType}
                  </span>
                )}
                {u.status === 'done' && !u.extractedType && (
                  <p className="text-xs text-green-700 mt-0.5">Completado</p>
                )}
              </div>

              {/* Progress bar */}
              {(u.status === 'uploading' || u.status === 'processing') && (
                <div className="w-20 shrink-0">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        u.status === 'uploading' ? 'bg-blue-500' : 'w-full bg-amber-400 animate-pulse'
                      )}
                      style={u.status === 'uploading' ? { width: `${u.progress}%` } : undefined}
                    />
                  </div>
                </div>
              )}

              {/* Remove button */}
              {(u.status === 'done' || u.status === 'error') && (
                <button
                  onClick={() => removeEntry(u.filename)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  title="Eliminar de la lista"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
