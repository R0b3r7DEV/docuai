'use client'

import { Building2, FileText, Users, Calendar } from 'lucide-react'
import { GESTORIA_MAX_CLIENTS } from '@/lib/stripe/constants'

interface Props {
  totalClients: number
  maxClients: number
  docsThisMonth: number
  activeClientsThisMonth: number
  currentPeriodEnd: string | null
  plan: string
}

export function GestoriaStatsBar({
  totalClients,
  maxClients,
  docsThisMonth,
  activeClientsThisMonth,
  currentPeriodEnd,
  plan,
}: Props) {
  const unlimited = maxClients === -1
  const periodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const clientPct = unlimited ? 0 : Math.min(100, (totalClients / maxClients) * 100)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Clients */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Empresas clientes
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold">{totalClients}</span>
          {!unlimited && <span className="text-sm text-muted-foreground mb-0.5">/ {maxClients}</span>}
          {unlimited && <span className="text-xs text-muted-foreground mb-0.5">ilimitadas</span>}
        </div>
        {!unlimited && (
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${clientPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Docs this month */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Documentos (mes)
        </div>
        <span className="text-2xl font-bold">{docsThisMonth}</span>
        <span className="text-xs text-muted-foreground">entre todos los clientes</span>
      </div>

      {/* Active clients */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Clientes activos
        </div>
        <span className="text-2xl font-bold">{activeClientsThisMonth}</span>
        <span className="text-xs text-muted-foreground">con actividad este mes</span>
      </div>

      {/* Next renewal */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Próxima renovación
        </div>
        <span className="text-sm font-semibold">{periodEnd ?? '—'}</span>
        <span className="text-xs text-muted-foreground capitalize">
          Plan {plan === 'gestoria_pro' ? 'Gestoría Pro' : 'Gestoría'}
        </span>
      </div>
    </div>
  )
}
