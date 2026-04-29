'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check, Zap, ShieldCheck, CreditCard, AlertCircle,
  Loader2, ExternalLink, Building2, Users, Sparkles, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils/cn'
import type { OrgPlan, SubscriptionStatus } from '@/types/database'

interface SubscriptionInfo {
  plan: OrgPlan
  subscriptionStatus: SubscriptionStatus
  trialDocsUsed: number
  currentPeriodEnd: string | null
}

const PLANS = [
  {
    id: 'pro',
    name: 'Plan Pro',
    price: '10 €',
    description: 'Para empresas individuales',
    icon: Zap,
    priceKey: 'STRIPE_PRICE_ID',
    features: [
      'Hasta 20 documentos al mes',
      'Facturas, presupuestos, nóminas y contratos',
      'Chat con IA sobre todos tus documentos',
      'Exportación a Excel ilimitada',
      'Soporte por email',
    ],
    highlight: false,
    badge: null,
  },
  {
    id: 'gestoria',
    name: 'Plan Gestoría',
    price: '99 €',
    description: 'Para gestorías y asesorías',
    icon: Building2,
    priceKey: 'STRIPE_GESTORIA_PRICE_ID',
    features: [
      'Hasta 50 empresas clientes',
      '20 documentos/mes por cliente',
      'Panel centralizado de gestión',
      'Invitaciones por email a clientes',
      'Vista de impersonación de cliente',
      'Estadísticas globales consolidadas',
      'Soporte prioritario',
    ],
    highlight: true,
    badge: 'Más popular',
  },
  {
    id: 'gestoria_pro',
    name: 'Plan Gestoría Pro',
    price: '199 €',
    description: 'Para grandes gestorías',
    icon: Users,
    priceKey: 'STRIPE_GESTORIA_PRO_PRICE_ID',
    features: [
      'Clientes ilimitados',
      '20 documentos/mes por cliente',
      'Todo lo del Plan Gestoría',
      'Acceso anticipado a nuevas funciones',
      'Soporte dedicado',
    ],
    highlight: false,
    badge: null,
  },
  {
    id: 'whitelabel',
    name: 'White-Label',
    price: '299 €',
    description: 'Para gestorías grandes',
    icon: Globe,
    priceKey: 'STRIPE_WL_PRICE_ID',
    features: [
      'Hasta 100 clientes bajo tu marca',
      'Logo, colores y nombre propios',
      'Oculta el branding de Lexia',
      'Email de soporte personalizado',
      'Footer y textos personalizados',
    ],
    highlight: false,
    badge: 'Para gestorías',
  },
  {
    id: 'whitelabel_pro',
    name: 'White-Label Pro',
    price: '599 €',
    description: 'Marca propia + dominio',
    icon: Globe,
    priceKey: 'STRIPE_WL_PRO_PRICE_ID',
    features: [
      'Clientes ilimitados bajo tu marca',
      'Dominio personalizado (app.migestoria.es)',
      'Todo lo del plan White-Label',
      'Acceso a API de gestión de dominio',
      'Soporte dedicado',
    ],
    highlight: false,
    badge: 'Para gestorías',
  },
]

export default function UpgradePage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [redirecting, setRedirecting] = useState<string | null>(null)
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

  const handleCheckout = async (planId: string) => {
    setRedirecting(planId)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al iniciar el pago')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setRedirecting(null)
    }
  }

  const handlePortal = async () => {
    setRedirecting('portal')
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al abrir el portal')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setRedirecting(null)
    }
  }

  const currentPlan = info?.plan ?? 'trial'
  const isActive = info?.subscriptionStatus === 'active'
  const isPastDue = info?.subscriptionStatus === 'past_due'
  const isSubscribed = isActive && currentPlan !== 'trial' && currentPlan !== 'free'

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
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isSubscribed ? 'Tu suscripción' : 'Elige tu plan'}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {isSubscribed
            ? 'Gestiona o cancela tu suscripción en cualquier momento'
            : 'Planes para empresas individuales y gestorías'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPastDue && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">Pago pendiente.</span> Actualiza tu método de pago.
          </AlertDescription>
        </Alert>
      )}

      {/* Active subscription summary */}
      {isSubscribed && (
        <Card className="border-primary/50 shadow-md">
          <CardContent className="flex items-center justify-between gap-4 py-5">
            <div>
              <p className="font-semibold">
                Plan {currentPlan === 'gestoria_pro' ? 'Gestoría Pro' : currentPlan === 'gestoria' ? 'Gestoría' : 'Pro'} activo
              </p>
              {periodEnd && <p className="text-sm text-muted-foreground">Próxima renovación: {periodEnd}</p>}
            </div>
            <Button variant="outline" className="gap-2 shrink-0" onClick={handlePortal} disabled={redirecting === 'portal'}>
              {redirecting === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Gestionar suscripción
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan cards */}
      {!isSubscribed && (
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map(plan => {
            const Icon = plan.icon
            const isCurrentPlan = currentPlan === plan.id && isActive
            const isRedirecting = redirecting === plan.id

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  plan.highlight ? 'border-2 border-primary shadow-lg' : 'border',
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-0.5 text-xs font-medium gap-1.5">
                      <Sparkles className="h-3 w-3" />{plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold">{plan.name}</h2>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 flex-1">
                  <ul className="flex flex-col gap-2 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full gap-2"
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={!!redirecting || isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <>Plan activo</>
                    ) : isRedirecting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Redirigiendo…</>
                    ) : (
                      <><CreditCard className="h-4 w-4" />Suscribirse</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Pago seguro con Stripe · Cancela en cualquier momento · Sin permanencia
      </div>
    </div>
  )
}
