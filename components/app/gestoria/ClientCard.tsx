'use client'

import Link from 'next/link'
import { Building2, FileText, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GESTORIA_DOCS_PER_CLIENT } from '@/lib/stripe/constants'
import { cn } from '@/lib/utils/cn'

interface Props {
  clientOrgId: string
  name: string
  slug: string
  docsThisMonth: number
  lastDocDate: string | null
  status: 'active' | 'inactive'
  onImpersonate?: (clientOrgId: string, clientName: string) => void
}

export function ClientCard({ clientOrgId, name, slug, docsThisMonth, lastDocDate, status, onImpersonate }: Props) {
  const pct = Math.min(100, (docsThisMonth / GESTORIA_DOCS_PER_CLIENT) * 100)
  const lastDoc = lastDocDate
    ? new Date(lastDocDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : null

  return (
    <div className={cn(
      'rounded-xl border bg-card p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200',
      status === 'inactive' && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{name}</p>
            <p className="text-xs text-muted-foreground">@{slug}</p>
          </div>
        </div>
        {status === 'inactive' && <Badge variant="secondary" className="shrink-0">Inactivo</Badge>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Docs este mes</span>
          <span className="font-medium text-foreground">{docsThisMonth} / {GESTORIA_DOCS_PER_CLIENT}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {lastDoc && (
        <p className="text-xs text-muted-foreground">Último doc: {lastDoc}</p>
      )}

      <div className="flex gap-2 mt-auto">
        <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1">
          <Link href={`/gestoria/clients/${clientOrgId}`}>
            Ver panel <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
        {onImpersonate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => onImpersonate(clientOrgId, name)}
          >
            <ExternalLink className="h-3 w-3" />
            Entrar
          </Button>
        )}
      </div>
    </div>
  )
}
