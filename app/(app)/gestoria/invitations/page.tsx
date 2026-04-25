'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Plus, Loader2, Clock, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InviteClientModal } from '@/components/app/gestoria/InviteClientModal'
import { cn } from '@/lib/utils/cn'

interface Invitation {
  id: string
  email: string
  company_name: string
  status: 'pending' | 'accepted' | 'expired' | 'canceled'
  expires_at: string
  created_at: string
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente',  icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  accepted: { label: 'Aceptada',   icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  expired:  { label: 'Caducada',   icon: XCircle,      color: 'text-muted-foreground', bg: 'bg-muted/40 border-border' },
  canceled: { label: 'Cancelada',  icon: X,            color: 'text-muted-foreground', bg: 'bg-muted/40 border-border' },
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [resending, setResending] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/gestoria/invitations')
    if (res.ok) {
      const data = await res.json() as { invitations: Invitation[] }
      setInvitations(data.invitations)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleResend = async (inv: Invitation) => {
    setResending(inv.id)
    try {
      // Cancel old + create new
      await fetch('/api/gestoria/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inv.email, company_name: inv.company_name }),
      })
      load()
    } finally {
      setResending(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Invitaciones</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona las invitaciones enviadas a empresas clientes.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />Nueva invitación
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : invitations.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 rounded-xl border text-center">
          <Mail className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Sin invitaciones</p>
            <p className="text-sm text-muted-foreground mt-1">Invita a tus clientes por email.</p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)}>Enviar primera invitación</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map(inv => {
            const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending
            const Icon = cfg.icon
            const sentDate = new Date(inv.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            const expiresDate = new Date(inv.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

            return (
              <div key={inv.id} className={cn('flex items-center gap-4 rounded-xl border px-5 py-4', cfg.bg)}>
                <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{inv.company_name}</p>
                    <Badge variant="outline" className={cn('text-xs', cfg.color)}>{cfg.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{inv.email} · Enviada {sentDate}</p>
                  {inv.status === 'pending' && (
                    <p className="text-xs text-muted-foreground">Caduca el {expiresDate}</p>
                  )}
                </div>
                {(inv.status === 'expired') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs gap-1"
                    disabled={resending === inv.id}
                    onClick={() => handleResend(inv)}
                  >
                    {resending === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Reenviar
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <InviteClientModal open={showModal} onClose={() => setShowModal(false)} onInvited={load} />
    </div>
  )
}
