'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, ExternalLink, TrendingUp, Loader2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GESTORIA_DOCS_PER_CLIENT } from '@/lib/stripe/constants'

const TYPE_LABELS: Record<string, string> = {
  factura: 'Facturas', presupuesto: 'Presupuestos', nomina: 'Nóminas',
  contrato: 'Contratos', albaran: 'Albaranes', extracto_bancario: 'Extractos',
  balance: 'Balances', otro: 'Otros',
}

interface ClientDetail {
  organization: { id: string; name: string; slug: string; plan: string; created_at: string }
  stats: {
    docs_this_month: number
    docs_total: number
    last_doc_date: string | null
    type_breakdown: Record<string, number>
  }
}

export default function ClientDetailPage({ params }: { params: Promise<{ clientOrgId: string }> }) {
  const { clientOrgId } = use(params)
  const [data, setData] = useState<ClientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [impersonating, setImpersonating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/gestoria/clients/${clientOrgId}`)
    if (res.ok) setData(await res.json())
    setIsLoading(false)
  }, [clientOrgId])

  useEffect(() => { load() }, [load])

  const handleImpersonate = async () => {
    setImpersonating(true)
    try {
      const res = await fetch(`/api/gestoria/clients/${clientOrgId}/impersonate`, { method: 'POST' })
      const d = await res.json() as { redirect_url?: string }
      if (d.redirect_url) window.location.href = d.redirect_url
    } finally {
      setImpersonating(false)
    }
  }

  const handleExport = () => {
    window.open(`/api/export?org_id=${clientOrgId}`, '_blank')
  }

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Cliente no encontrado o sin acceso.</p>
        <Button asChild variant="outline"><Link href="/gestoria/clients">← Volver</Link></Button>
      </div>
    )
  }

  const { organization: org, stats } = data
  const pct = Math.min(100, (stats.docs_this_month / GESTORIA_DOCS_PER_CLIENT) * 100)
  const totalBreakdown = Object.values(stats.type_breakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 mb-2 text-muted-foreground">
            <Link href="/gestoria/clients"><ArrowLeft className="h-3.5 w-3.5" />Volver</Link>
          </Button>
          <h2 className="text-2xl font-semibold">{org.name}</h2>
          <p className="text-sm text-muted-foreground">@{org.slug} · Desde {new Date(org.created_at).toLocaleDateString('es-ES')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <FileText className="h-4 w-4" />Exportar Excel
          </Button>
          <Button size="sm" className="gap-2" onClick={handleImpersonate} disabled={impersonating}>
            {impersonating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Ver como cliente
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <FileText className="h-3.5 w-3.5" />Docs este mes
          </div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-3xl font-bold">{stats.docs_this_month}</span>
            <span className="text-sm text-muted-foreground mb-0.5">/ {GESTORIA_DOCS_PER_CLIENT}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <TrendingUp className="h-3.5 w-3.5" />Total documentos
          </div>
          <span className="text-3xl font-bold">{stats.docs_total}</span>
        </div>

        <div className="rounded-xl border bg-card p-5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <BarChart3 className="h-3.5 w-3.5" />Último documento
          </div>
          <span className="font-semibold">
            {stats.last_doc_date
              ? new Date(stats.last_doc_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
              : '—'}
          </span>
        </div>
      </div>

      {/* Type breakdown */}
      {Object.keys(stats.type_breakdown).length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-medium mb-4">Tipos de documentos</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(stats.type_breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const pct = Math.round((count / totalBreakdown) * 100)
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-28 text-sm text-muted-foreground shrink-0">{TYPE_LABELS[type] ?? type}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-sm text-right font-medium">{count}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
