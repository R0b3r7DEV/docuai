'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, ArrowUpFromLine, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StatusBadge } from './StatusBadge'
import type { DocumentWithExtraction } from '@/types/database'
import type { DocumentFilters, PaginationState, SortColumn, SortDirection } from '@/types/api'

// ── Type badge colours ──────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, string> = {
  factura:          'bg-blue-100 text-blue-800',
  presupuesto:      'bg-purple-100 text-purple-800',
  nomina:           'bg-green-100 text-green-800',
  contrato:         'bg-orange-100 text-orange-800',
  albaran:          'bg-teal-100 text-teal-800',
  extracto_bancario:'bg-indigo-100 text-indigo-800',
  balance:          'bg-pink-100 text-pink-800',
  otro:             'bg-gray-100 text-gray-700',
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
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', TYPE_STYLES[type] ?? 'bg-gray-100 text-gray-700')}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

// ── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-muted" style={{ width: i === 0 ? '60%' : i === 6 ? '40%' : '80%' }} />
        </td>
      ))}
    </tr>
  )
}

// ── Sort icon ───────────────────────────────────────────────────────────────
function SortIcon({ column, sortCol, sortDir }: { column: string; sortCol: string | null; sortDir: SortDirection }) {
  if (sortCol !== column) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50 ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 ml-1 inline" />
    : <ChevronDown className="h-3 w-3 ml-1 inline" />
}

// ── Props ───────────────────────────────────────────────────────────────────
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

export function DocumentTable({
  documents,
  isLoading,
  currentFilters,
  onFilter,
  onDelete,
  pagination,
  onPageChange,
}: Props) {
  const router = useRouter()
  const [sortCol, setSortCol] = useState<SortColumn | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')

  const handleSort = (col: SortColumn) => {
    const newDir: SortDirection = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc'
    setSortCol(col)
    setSortDir(newDir)
  }

  const handleDelete = async (e: React.MouseEvent, id: string, filename: string) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${filename}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setDeleting(null)
    }
  }

  const applyDateFilter = () => {
    onFilter({ ...currentFilters, page: 1, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
  }

  // Client-side sort
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
    <th
      className="text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      {label}
      <SortIcon column={col} sortCol={sortCol} sortDir={sortDir} />
    </th>
  )

  // ── Filter bar ─────────────────────────────────────────────────────────
  const filterBar = (
    <div className="flex flex-wrap gap-3 items-end mb-4">
      {/* Type filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Tipo</label>
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={currentFilters.type ?? ''}
          onChange={(e) => onFilter({ ...currentFilters, page: 1, type: (e.target.value as DocumentFilters['type']) || undefined })}
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Category filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Categoría</label>
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={currentFilters.category ?? ''}
          onChange={(e) => onFilter({ ...currentFilters, page: 1, category: (e.target.value as DocumentFilters['category']) || undefined })}
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Date range */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Desde</label>
        <input
          type="date"
          className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onBlur={applyDateFilter}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Hasta</label>
        <input
          type="date"
          className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onBlur={applyDateFilter}
        />
      </div>

      {/* Clear */}
      {(currentFilters.type || currentFilters.category || currentFilters.dateFrom || currentFilters.dateTo) && (
        <button
          className="text-xs text-muted-foreground hover:text-foreground underline self-end pb-1.5"
          onClick={() => {
            setDateFrom(''); setDateTo('')
            onFilter({ page: 1, limit: currentFilters.limit ?? 20 })
          }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {filterBar}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Archivo', 'Tipo', 'Proveedor', 'Concepto', 'Importe', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (sorted.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {filterBar}
        <div className="flex flex-col items-center justify-center gap-3 h-52 rounded-xl border border-dashed text-center px-4">
          <ArrowUpFromLine className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium text-muted-foreground">
            {currentFilters.type || currentFilters.category || currentFilters.dateFrom
              ? 'No hay documentos con los filtros seleccionados'
              : 'Sin documentos — sube tu primer archivo arriba'}
          </p>
        </div>
      </div>
    )
  }

  // ── Main table ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {filterBar}

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {colHeader('Archivo', 'filename')}
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              {colHeader('Proveedor', 'vendor')}
              <th className="text-left px-4 py-3 font-medium">Concepto</th>
              {colHeader('Importe', 'amount')}
              {colHeader('Fecha', 'issue_date')}
              {colHeader('Estado', 'status')}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((doc) => (
              <tr
                key={doc.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => router.push(`/app/documents/${doc.id}`)}
              >
                <td className="px-4 py-3 max-w-[180px] truncate font-medium">{doc.filename}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <TypeBadge type={doc.extraction?.type} />
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">
                  {doc.extraction?.vendor ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                  {doc.extraction?.concept ?? '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                  {doc.extraction?.amount != null
                    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: doc.extraction.currency ?? 'EUR' }).format(doc.extraction.amount)
                    : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {doc.extraction?.issue_date ?? '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {(doc.status === 'processing') && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    )}
                    <StatusBadge status={doc.status} />
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleDelete(e, doc.id, doc.filename)}
                    disabled={deleting === doc.id}
                    className="text-muted-foreground hover:text-red-600 disabled:opacity-40 transition-colors"
                    title="Eliminar documento"
                  >
                    {deleting === doc.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > (pagination.limit ?? 20) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{pagination.total} documentos · Página {pagination.page}</span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={pagination.page * (pagination.limit ?? 20) >= pagination.total}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
