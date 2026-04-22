'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DocumentFilters } from '@/types/api'

interface Props {
  filters: DocumentFilters
  disabled?: boolean
}

export function ExportButton({ filters, disabled }: Props) {
  const [isExporting, setIsExporting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo)   params.set('dateTo', filters.dateTo)
      if (filters.type)     params.set('type', filters.type)
      if (filters.category) params.set('category', filters.category)

      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const a = document.createElement('a')
      a.href = url; a.download = `docuai_export_${date}.xlsx`; a.click()
      URL.revokeObjectURL(url)
      showToast('success', 'Exportación descargada correctamente')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={disabled || isExporting}>
        {isExporting
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Download className="h-3.5 w-3.5" />}
        {isExporting ? 'Exportando…' : 'Exportar Excel'}
      </Button>

      {toast && (
        <div className={`absolute top-full mt-2 right-0 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg whitespace-nowrap ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  )
}
