'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onInvited: () => void
}

export function InviteClientModal({ open, onClose, onInvited }: Props) {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleClose = () => {
    setEmail(''); setCompanyName(''); setError(null); setSent(false); onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gestoria/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company_name: companyName }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      setSent(true)
      onInvited()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invitar empresa cliente
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold">¡Invitación enviada!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Se ha enviado un email a <strong>{email}</strong> con el enlace de acceso.
              </p>
            </div>
            <Button onClick={handleClose}>Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-company">Nombre de la empresa</Label>
              <Input
                id="invite-company"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ej. Distribuciones García S.L."
                required
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email de contacto</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                required
              />
            </div>

            {/* Preview */}
            {email && companyName && (
              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Se enviará un email a <strong className="text-foreground">{email}</strong> con
                un enlace de activación para <strong className="text-foreground">{companyName}</strong>.
                El enlace caduca en 7 días. Tu gestoría paga — el cliente no paga nada.
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !email || !companyName}>
                {isLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Enviando…</>
                  : <><Mail className="h-4 w-4 mr-1.5" />Enviar invitación</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
