'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props { params: Promise<{ token: string }> }

export default function InviteCompletePage({ params }: Props) {
  const { token } = use(params)
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.replace(`/invite/${token}`)
      return
    }

    const accept = async () => {
      try {
        const res = await fetch('/api/gestoria/invitations/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, clerk_user_id: user.id }),
        })
        const data = await res.json() as { success?: boolean; redirect_url?: string; error?: string }
        if (!res.ok || !data.success) throw new Error(data.error ?? 'Error al aceptar la invitación')
        setStatus('success')
        setTimeout(() => {
          router.replace(data.redirect_url ?? '/app/documents')
        }, 1500)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
        setStatus('error')
      }
    }

    accept()
  }, [isLoaded, user, token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full flex flex-col items-center gap-6 text-center rounded-2xl border bg-card p-10">
        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="font-semibold text-lg">Activando tu cuenta…</p>
              <p className="text-sm text-muted-foreground mt-1">Estamos vinculando tu empresa, un momento.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">¡Cuenta activada!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirigiendo a tu panel…</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-lg">Error al activar la cuenta</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <Button onClick={() => router.replace('/app/documents')}>Ir al inicio</Button>
          </>
        )}
      </div>
    </div>
  )
}
