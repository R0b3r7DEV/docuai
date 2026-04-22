import { cn } from '@/lib/utils/cn'
import type { DocumentStatus } from '@/types/database'

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  processing: { label: 'Procesando', className: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse' },
  done:       { label: 'Completado', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  error:      { label: 'Error',      className: 'bg-red-100 text-red-700 border-red-200' },
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      className
    )}>
      {label}
    </span>
  )
}
