'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { OrgPlan } from '@/types/database'

interface Props {
  used: number
  limit: number
  plan: OrgPlan
  label?: string
}

export function UsageMeter({ used, limit, plan, label = 'Documentos procesados' }: Props) {
  const isUnlimited = !isFinite(limit)
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)

  const barColor = isUnlimited
    ? 'bg-primary'
    : percentage >= 80
    ? 'bg-red-500'
    : percentage >= 60
    ? 'bg-amber-500'
    : 'bg-green-500'

  const showUpgradeLink = !isUnlimited && percentage >= 80 && plan === 'free'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {isUnlimited ? (
            <span>{used.toLocaleString('es-ES')} / ∞</span>
          ) : (
            <span>
              {used.toLocaleString('es-ES')} / {limit.toLocaleString('es-ES')}
            </span>
          )}
          <span className="ml-2 text-xs text-muted-foreground uppercase">{plan}</span>
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {showUpgradeLink && (
        <p className="text-xs text-red-600">
          Has alcanzado el {Math.round(percentage)}% de tu límite.{' '}
          <Link href="/app/settings?upgrade=1" className="underline hover:no-underline font-medium">
            Actualiza a Pro
          </Link>{' '}
          para más documentos.
        </p>
      )}
    </div>
  )
}
