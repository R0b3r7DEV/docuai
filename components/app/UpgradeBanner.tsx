'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { TRIAL_DOC_LIMIT, PRO_DOC_LIMIT } from '@/lib/stripe/constants'

interface OrgUsage {
  plan: string
  subscriptionStatus: string
  trialDocsUsed: number
  monthlyUsed: number
}

export function UpgradeBanner() {
  const [usage, setUsage] = useState<OrgUsage | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setUsage({
          plan: data.org?.plan ?? 'trial',
          subscriptionStatus: data.org?.subscription_status ?? 'trialing',
          trialDocsUsed: data.org?.trial_docs_used ?? 0,
          monthlyUsed: data.usage?.used ?? 0,
        })
      })
      .catch(() => null)
  }, [])

  if (!usage || dismissed) return null

  const { plan, subscriptionStatus, trialDocsUsed, monthlyUsed } = usage

  // Trial plan: show when limit reached
  if ((plan === 'trial' || plan === 'free') && trialDocsUsed >= TRIAL_DOC_LIMIT) {
    return (
      <BannerUI
        variant="error"
        message={`Has usado tus ${TRIAL_DOC_LIMIT} documentos de prueba. Suscríbete para continuar subiendo.`}
        ctaLabel="Suscribirse por 10 €/mes"
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Pro plan near limit (18/20)
  if (plan === 'pro' && subscriptionStatus === 'active' && monthlyUsed >= PRO_DOC_LIMIT - 2) {
    return (
      <BannerUI
        variant="warning"
        message={`Estás cerca del límite mensual (${monthlyUsed}/${PRO_DOC_LIMIT} documentos).`}
        ctaLabel="Ver planes"
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Past due subscription
  if (subscriptionStatus === 'past_due') {
    return (
      <BannerUI
        variant="error"
        message="Tu suscripción tiene un pago pendiente. Actualiza tu método de pago para no perder el acceso."
        ctaLabel="Actualizar pago"
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  return null
}

function BannerUI({
  variant,
  message,
  ctaLabel,
  onDismiss,
}: {
  variant: 'warning' | 'error'
  message: string
  ctaLabel: string
  onDismiss: () => void
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
      variant === 'error'
        ? 'bg-red-50 border border-red-200 text-red-800'
        : 'bg-amber-50 border border-amber-200 text-amber-800'
    )}>
      <AlertTriangle className={cn('h-4 w-4 shrink-0', variant === 'error' ? 'text-red-500' : 'text-amber-500')} />
      <p className="flex-1">{message}</p>
      <Button
        asChild
        size="sm"
        variant={variant === 'error' ? 'destructive' : 'default'}
        className="shrink-0 h-7 text-xs gap-1"
      >
        <Link href="/app/upgrade">
          {ctaLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
      <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
