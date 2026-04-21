import { cn } from '@/lib/utils/cn'
import type { DocumentStatus } from '@/types/database'

interface Props {
  status: DocumentStatus
}

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  pending:    { label: 'Pendiente',    className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Procesando',  className: 'bg-blue-100 text-blue-800 animate-pulse' },
  done:       { label: 'Completado',  className: 'bg-green-100 text-green-800' },
  error:      { label: 'Error',       className: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status }: Props) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}
