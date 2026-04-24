'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, Zap, ShieldCheck, CreditCard, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { OrgPlan, SubscriptionStatus } from '@/types/database'

interface SubscriptionInfo {
  plan: OrgPlan
  subscriptionStatus: SubscriptionStatus
  trialDocsUsed: number
  currentPeriodEnd: string | null
}

const FEATURES = [
  'Hasta 20 documentos al mes',
  'Facturas, presupuestos, nóminas y contratos',
  'Chat con IA sobre todos tus documentos',
  'Exportación a Excel ilimitada',
  'Soporte por email',
]

export default function UpgradePage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) return
      const data = await res.json()
      setInfo({
        plan: data.org.plan,
        subscriptionStatus: data.org.subscription_status ?? 'trialing',
        trialDocsUsed: data.org.trial_docs_used ?? 0,
        currentPeriodEnd: data.org.current_period_end ?? null,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadInfo() }, [loadInfo])

  const handleCheckout = async () => {
    setIsRedirecting(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al iniciar el pago')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setIsRedirecting(false)
    }
  }

  const handlePortal = async () => {
    setIsRedirecting(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al abrir el portal')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setIsRedirecting(false)
    }
  }

  const isPro = info?.plan === 'pro' && info?.subscriptionStatus === 'active'
  const isPastDue = info?.subscriptionStatus === 'past_due'

  const periodEnd = info?.currentPeriodEnd
    ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(info.currentPeriodEnd))
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Zap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isPro ? 'Tu suscripción' : 'Desbloquea DocuAI completo'}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {isPro
            ? 'Gestiona o cancela tu suscripción en cualquier momento'
            : '10 € al mes · Cancela cuando quieras'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Past due warning */}
      {isPastDue && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">Pago pendiente.</span> Actualiza tu método de pago para mantener el acceso.
          </AlertDescription>
        </Alert>
      )}

      {/* Plan card */}
      <Card className={isPro ? 'border-primary/50 shadow-md' : 'border-2 border-primary shadow-lg'}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold">Plan Pro</h2>
                {isPro && <Badge className="text-xs">Activo</Badge>}
                {!isPro && <Badge variant="secondary" className="text-xs">Prueba gratuita: {info?.trialDocsUsed ?? 0}/2 docs usados</Badge>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">10 €</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </div>
          </div>

          {isPro && periodEnd && (
            <p className="text-sm text-muted-foreground mt-2">
              Próxima renovación: <span className="font-medium text-foreground">{periodEnd}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <ul className="flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          {isPro ? (
            <Button variant="outline" className="w-full gap-2" onClick={handlePortal} disabled={isRedirecting}>
              {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              {isRedirecting ? 'Abriendo portal…' : 'Gestionar suscripción'}
            </Button>
          ) : (
            <Button className="w-full h-12 text-base gap-2" onClick={handleCheckout} disabled={isRedirecting}>
              {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {isRedirecting ? 'Redirigiendo a Stripe…' : 'Suscribirse por 10 €/mes'}
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Pago seguro con Stripe · Cancela en cualquier momento
          </div>
        </CardContent>
      </Card>

      {!isPro && (
        <p className="text-center text-sm text-muted-foreground">
          Sin tarjeta de crédito para la prueba gratuita · Solo necesitas una tarjeta para suscribirte
        </p>
      )}
    </div>
  )
}
