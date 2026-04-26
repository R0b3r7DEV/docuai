'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface WlClient {
  client_org_id: string
  status: string
  created_at: string
  docs_this_month: number
  organizations: { id: string; name: string; slug: string; plan: string } | null
}

export default function WhitelabelClientsPage() {
  const [clients, setClients] = useState<WlClient[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/whitelabel/clients').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([clientsData, settingsData]) => {
      setClients(clientsData.clients ?? [])
      setPlan(settingsData.org?.plan ?? '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const isWlPlan = plan === 'whitelabel' || plan === 'whitelabel_pro'
  const totalDocs = clients.reduce((sum, c) => sum + c.docs_this_month, 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!isWlPlan) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="text-muted-foreground">Esta sección requiere el plan White-Label.</p>
        <Button asChild><a href="/app/upgrade">Ver planes</a></Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes White-Label</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona los clientes bajo tu marca</p>
        </div>
        <Button asChild>
          <Link href="/gestoria/invitations">Añadir cliente</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total clientes', value: clients.length, icon: Users },
          { label: 'Docs este mes', value: totalDocs, icon: FileText },
          { label: 'Clientes activos', value: clients.filter(c => c.status === 'active').length, icon: Users },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No tienes clientes aún. Invita al primero.</p>
          ) : (
            <div className="divide-y">
              {clients.map(c => (
                <div key={c.client_org_id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{c.organizations?.name ?? c.client_org_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.docs_this_month} docs este mes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {c.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/gestoria/clients/${c.client_org_id}`}>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
