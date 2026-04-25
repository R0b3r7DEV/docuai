'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Mail, Search, Loader2, Building2, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AddClientModal } from '@/components/app/gestoria/AddClientModal'
import { InviteClientModal } from '@/components/app/gestoria/InviteClientModal'
import { GESTORIA_DOCS_PER_CLIENT } from '@/lib/stripe/constants'

interface ClientRow {
  id: string
  client_org_id: string
  status: string
  organization: { id: string; name: string; slug: string } | null
  docs_this_month: number
  last_doc_date: string | null
}

export default function GestoriaClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [impersonating, setImpersonating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/gestoria/clients')
    if (res.ok) {
      const data = await res.json() as { clients: ClientRow[] }
      setClients(data.clients)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = clients.filter(c =>
    !search ||
    c.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
    c.organization?.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleUnlink = async (clientOrgId: string) => {
    if (!confirm('¿Desvincular este cliente? Sus datos no se borrarán.')) return
    setDeletingId(clientOrgId)
    try {
      await fetch(`/api/gestoria/clients/${clientOrgId}`, { method: 'DELETE' })
      load()
    } finally {
      setDeletingId(null)
    }
  }

  const handleImpersonate = async (clientOrgId: string) => {
    setImpersonating(true)
    try {
      const res = await fetch(`/api/gestoria/clients/${clientOrgId}/impersonate`, { method: 'POST' })
      const data = await res.json() as { redirect_url?: string }
      if (data.redirect_url) window.location.href = data.redirect_url
    } finally {
      setImpersonating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Empresas clientes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowInviteModal(true)}>
            <Mail className="h-4 w-4" />Invitar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />Añadir
          </Button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{search ? 'Sin resultados' : 'Sin clientes todavía'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Docs (mes)</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Último doc</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => {
                  const org = client.organization
                  const lastDoc = client.last_doc_date
                    ? new Date(client.last_doc_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : '—'
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
                        {client.docs_this_month} / {GESTORIA_DOCS_PER_CLIENT}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{lastDoc}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {client.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                            <Link href={`/gestoria/clients/${client.client_org_id}`}>Ver</Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={impersonating}
                            onClick={() => handleImpersonate(client.client_org_id)}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                            disabled={deletingId === client.client_org_id}
                            onClick={() => handleUnlink(client.client_org_id)}>
                            {deletingId === client.client_org_id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={load} />
      <InviteClientModal open={showInviteModal} onClose={() => setShowInviteModal(false)} onInvited={load} />
    </div>
  )
}
