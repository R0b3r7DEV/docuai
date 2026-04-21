'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
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
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      if (filters.type) params.set('type', filters.type)
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
      a.href = url
      a.download = `docuai_export_${date}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      showToast('success', 'Exportación descargada correctamente')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar'
      showToast('error', message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isExporting ? 'Exportando…' : 'Exportar Excel'}
      </button>

      {toast && (
        <div
          className={`absolute top-full mt-2 right-0 z-50 rounded-lg px-4 py-2.5 text-sm font-medium shadow-md whitespace-nowrap ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
