'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Loader2, ArrowUpFromLine, Trash2,
  Filter, X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DocumentWithExtraction } from '@/types/database'
import type { DocumentFilters, PaginationState, SortColumn, SortDirection } from '@/types/api'

const TYPE_STYLES: Record<string, string> = {
  factura:          'bg-blue-100 text-blue-700 border-blue-200',
  presupuesto:      'bg-violet-100 text-violet-700 border-violet-200',
  nomina:           'bg-emerald-100 text-emerald-700 border-emerald-200',
  contrato:         'bg-orange-100 text-orange-700 border-orange-200',
  albaran:          'bg-teal-100 text-teal-700 border-teal-200',
  extracto_bancario:'bg-indigo-100 text-indigo-700 border-indigo-200',
  balance:          'bg-pink-100 text-pink-700 border-pink-200',
  otro:             'bg-muted text-muted-foreground border-border',
}
const TYPE_LABELS: Record<string, string> = {
  factura: 'Factura', presupuesto: 'Presupuesto', nomina: 'Nómina',
  contrato: 'Contrato', albaran: 'Albarán', extracto_bancario: 'Extracto',
  balance: 'Balance', otro: 'Otro',
}
const CATEGORY_LABELS: Record<string, string> = {
  suministros: 'Suministros', servicios: 'Servicios', personal: 'Personal',
  alquiler: 'Alquiler', material: 'Material', impuestos: 'Impuestos', otro: 'Otro',
}

function TypeBadge({ type }: { type: string | null | undefined }) {
  if (!type) return <span className="text-muted-foreground">—</span>
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      TYPE_STYLES[type] ?? 'bg-muted text-muted-foreground'
    )}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

function SortIcon({ column, sortCol, sortDir }: { column: string; sortCol: string | null; sortDir: SortDirection }) {
  if (sortCol !== column) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40 ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 ml-1 inline text-primary" />
    : <ChevronDown className="h-3 w-3 ml-1 inline text-primary" />
}

interface Props {
  documents: DocumentWithExtraction[]
  isLoading: boolean
  currentFilters: DocumentFilters
  onFilter: (filters: DocumentFilters) => void
  onDelete: (id: string) => Promise<void>
  pagination: PaginationState
  onPageChange: (page: number) => void
  onSort: (column: SortColumn, direction: SortDirection) => void
}

export function DocumentTable({ documents, isLoading, currentFilters, onFilter, onDelete, pagination, onPageChange }: Props) {
  const router = useRouter()
  const [sortCol, setSortCol] = useState<SortColumn | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasFilters = !!(currentFilters.type || currentFilters.category || currentFilters.dateFrom || currentFilters.dateTo)

  const handleSort = (col: SortColumn) => {
    const dir: SortDirection = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc'
    setSortCol(col); setSortDir(dir)
  }

  const handleDelete = async (e: React.MouseEvent, id: string, filename: string) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${filename}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try { await onDelete(id) } finally { setDeleting(null) }
  }

  const applyDateFilter = () => {
    onFilter({ ...currentFilters, page: 1, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
  }

  const sorted = useMemo(() => {
    if (!sortCol) return documents
    return [...documents].sort((a, b) => {
      let av: string | number | null = null
      let bv: string | number | null = null
      if (sortCol === 'filename') { av = a.filename; bv = b.filename }
      else if (sortCol === 'created_at') { av = a.created_at; bv = b.created_at }
      else if (sortCol === 'status') { av = a.status; bv = b.status }
      else if (sortCol === 'amount') { av = a.extraction?.amount ?? null; bv = b.extraction?.amount ?? null }
      else if (sortCol === 'vendor') { av = a.extraction?.vendor ?? null; bv = b.extraction?.vendor ?? null }
      else if (sortCol === 'issue_date') { av = a.extraction?.issue_date ?? null; bv = b.extraction?.issue_date ?? null }
      if (av === null && bv === null) return 0
      if (av === null) return sortDir === 'asc' ? 1 : -1
      if (bv === null) return sortDir === 'asc' ? -1 : 1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [documents, sortCol, sortDir])

  const colHeader = (label: string, col: SortColumn) => (
    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => handleSort(col)}>
      {label}<SortIcon column={col} sortCol={sortCol} sortDir={sortDir} />
    </th>
  )

  const filterBar = (
    <div className="flex flex-wrap gap-3 items-end p-4 border-b bg-muted/20">
      <Filter className="h-4 w-4 text-muted-foreground self-end mb-2 shrink-0" />

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Tipo</Label>
        <Select
          value={currentFilters.type ?? ''}
          onValueChange={(v) => onFilter({ ...currentFilters, page: 1, type: (v as DocumentFilters['type']) || undefined })}
        >
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Categoría</Label>
        <Select
          value={currentFilters.category ?? ''}
          onValueChange={(v) => onFilter({ ...currentFilters, page: 1, category: (v as DocumentFilters['category']) || undefined })}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Desde</Label>
        <Input type="date" className="h-8 w-36 text-xs"
          value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} onBlur={applyDateFilter} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Hasta</Label>
        <Input type="date" className="h-8 w-36 text-xs"
          value={dateTo} onChange={(e) => setDateTo(e.target.value)} onBlur={applyDateFilter} />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground self-end"
          onClick={() => { setDateFrom(''); setDateTo(''); onFilter({ page: 1, limit: currentFilters.limit ?? 20 }) }}>
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border overflow-hidden">
        {filterBar}
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>{['Archivo', 'Tipo', 'Proveedor', 'Concepto', 'Importe', 'Fecha', 'Estado', ''].map(h => (
              <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[180, 80, 120, 160, 80, 90, 70, 30].map((w, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <Skeleton className="h-4 rounded" style={{ width: w }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border overflow-hidden">
        {filterBar}
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ArrowUpFromLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold mb-1">
              {hasFilters ? 'Sin resultados' : 'Sin documentos'}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'No hay documentos con los filtros seleccionados' : 'Sube tu primer archivo arriba'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      {filterBar}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              {colHeader('Archivo', 'filename')}
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
              {colHeader('Proveedor', 'vendor')}
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Concepto</th>
              {colHeader('Importe', 'amount')}
              {colHeader('Fecha', 'issue_date')}
              {colHeader('Estado', 'status')}
              <th className="px-4 py-3.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((doc) => (
              <tr key={doc.id}
                className="group cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => router.push(`/app/documents/${doc.id}`)}>
                <td className="px-4 py-3.5 max-w-[180px]">
                  <span className="truncate font-medium block">{doc.filename}</span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <TypeBadge type={doc.extraction?.type} />
                </td>
                <td className="px-4 py-3.5 text-muted-foreground max-w-[140px]">
                  <span className="truncate block">{doc.extraction?.vendor ?? '—'}</span>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground max-w-[160px]">
                  <span className="truncate block">{doc.extraction?.concept ?? '—'}</span>
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap font-medium">
                  {doc.extraction?.amount != null
                    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: doc.extraction.currency ?? 'EUR' }).format(doc.extraction.amount)
                    : <span className="text-muted-foreground font-normal">—</span>}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground text-xs">
                  {doc.extraction?.issue_date ?? '—'}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {doc.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    <StatusBadge status={doc.status} />
                  </div>
                </td>
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    disabled={deleting === doc.id}
                    onClick={(e) => handleDelete(e, doc.id, doc.filename)}
                    title="Eliminar">
                    {deleting === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.total > (pagination.limit ?? 20) && (
        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground bg-muted/20">
          <span>
            {pagination.total} documentos · Página {pagination.page} de {Math.ceil(pagination.total / (pagination.limit ?? 20))}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs"
              disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"
              disabled={pagination.page * (pagination.limit ?? 20) >= pagination.total}
              onClick={() => onPageChange(pagination.page + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export labels for external use
export { TYPE_LABELS, CATEGORY_LABELS }
