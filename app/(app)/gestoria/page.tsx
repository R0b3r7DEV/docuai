'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Mail, Loader2, Building2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GestoriaStatsBar } from '@/components/app/gestoria/GestoriaStatsBar'
import { AddClientModal } from '@/components/app/gestoria/AddClientModal'
import { InviteClientModal } from '@/components/app/gestoria/InviteClientModal'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { GESTORIA_DOCS_PER_CLIENT } from '@/lib/stripe/constants'

interface StatsData {
  total_clients: number
  active_clients_this_month: number
  docs_this_month: number
  top_clients: Array<{ client_org_id: string; name: string; slug: string; docs_this_month: number }>
  type_breakdown: Record<string, number>
  weekly_evolution: number[]
  gestoria: {
    name: string
    plan: string
    subscription_status: string
    client_count: number
    max_clients: number
    current_period_end: string | null
  }
}

interface ClientRow {
  id: string
  client_org_id: string
  status: string
  organization: { id: string; name: string; slug: string; plan: string } | null
  docs_this_month: number
  last_doc_date: string | null
}

export default function GestoriaDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [impersonating, setImpersonating] = useState(false)

  const load = useCallback(async () => {
    const [statsRes, clientsRes] = await Promise.all([
      fetch('/api/gestoria/stats'),
      fetch('/api/gestoria/clients'),
    ])
    if (statsRes.ok) setStats(await statsRes.json())
    if (clientsRes.ok) {
      const data = await clientsRes.json() as { clients: ClientRow[] }
      setClients(data.clients)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleImpersonate = async (clientOrgId: string, clientName: string) => {
    setImpersonating(true)
    try {
      const res = await fetch(`/api/gestoria/clients/${clientOrgId}/impersonate`, { method: 'POST' })
      const data = await res.json() as { redirect_url?: string; error?: string }
      if (data.redirect_url) window.location.href = data.redirect_url
    } finally {
      setImpersonating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const g = stats?.gestoria

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Panel de Gestoría</h2>
          {g && <p className="text-sm text-muted-foreground mt-0.5">{g.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowInviteModal(true)}>
            <Mail className="h-4 w-4" />
            Invitar cliente
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Añadir cliente
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && g && (
        <GestoriaStatsBar
          totalClients={g.client_count}
          maxClients={g.max_clients}
          docsThisMonth={stats.docs_this_month}
          activeClientsThisMonth={stats.active_clients_this_month}
          currentPeriodEnd={g.current_period_end}
          plan={g.plan}
        />
      )}

      {/* Clients table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-medium">Empresas clientes ({clients.length})</h3>
          <Link href="/gestoria/clients" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Ver todas →
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Sin empresas clientes todavía</p>
              <p className="text-sm text-muted-foreground mt-1">Añade o invita tu primera empresa cliente.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>Invitar por email</Button>
              <Button size="sm" onClick={() => setShowAddModal(true)}>Añadir directamente</Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Docs este mes</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Último doc</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => {
                  const org = client.organization
                  const lastDoc = client.last_doc_date
                    ? new Date(client.last_doc_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : '—'
                  const pct = Math.min(100, (client.docs_this_month / GESTORIA_DOCS_PER_CLIENT) * 100)

                  return (
                    <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{org?.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">@{org?.slug ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 w-28">
                          <span>{client.docs_this_month} / {GESTORIA_DOCS_PER_CLIENT}</span>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{lastDoc}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {client.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            <Link href={`/gestoria/clients/${client.client_org_id}`}>Ver panel</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled={impersonating}
                            onClick={() => handleImpersonate(client.client_org_id, org?.name ?? '')}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Entrar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={load} />
      <InviteClientModal open={showInviteModal} onClose={() => setShowInviteModal(false)} onInvited={load} />
    </div>
  )
}
