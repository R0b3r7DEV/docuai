'use client'

import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { OrgPlan } from '@/types/database'

const PLAN_LABELS: Record<OrgPlan, string> = {
  trial: 'Prueba',
  free: 'Gratis',
  pro: 'Pro',
  gestoria: 'Gestoría',
  gestoria_pro: 'Gestoría Pro',
  whitelabel: 'White-Label',
  whitelabel_pro: 'White-Label Pro',
  enterprise: 'Enterprise',
}

interface Props {
  used: number
  limit: number
  plan: OrgPlan
  label?: string
}

export function UsageMeter({ used, limit, plan, label = 'Documentos procesados' }: Props) {
  const isUnlimited = !isFinite(limit)
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)
  const isNearLimit = !isUnlimited && percentage >= 80
  const showUpgrade = isNearLimit && plan === 'free'

  const indicatorClass = isUnlimited ? 'bg-primary'
    : percentage >= 80 ? 'bg-destructive'
    : percentage >= 60 ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {used.toLocaleString('es-ES')}
            {!isUnlimited && <span className="text-muted-foreground font-normal"> / {limit.toLocaleString('es-ES')}</span>}
            {isUnlimited && <span className="text-muted-foreground font-normal"> / ∞</span>}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {PLAN_LABELS[plan]}
          </Badge>
        </div>
      </div>

      {!isUnlimited && (
        <div className="relative">
          <Progress value={percentage} className="h-2" indicatorClassName={indicatorClass} />
          {isNearLimit && (
            <p className="text-xs text-muted-foreground mt-2">
              <span className={isNearLimit ? 'text-destructive font-medium' : ''}>
                {Math.round(percentage)}% utilizado
              </span>
              {showUpgrade && (
                <>
                  {' · '}
                  <Link href="/app/settings?upgrade=1" className="text-primary underline hover:no-underline font-medium">
                    Actualiza a Pro
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
