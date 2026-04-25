'use client'

import { FileText, TrendingUp, TrendingDown, Euro, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Stats {
  totalDocs: number
  docsThisMonth: number
  docsLastMonth: number
  monthDelta: number | null
  totalAmountThisMonth: number | null
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null
  const up = delta >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}{delta}% vs mes anterior
    </span>
  )
}

export function StatsOverview({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Documentos procesados',
      value: stats.totalDocs.toLocaleString('es-ES'),
      sub: 'Total histórico',
      icon: FileText,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      title: 'Este mes',
      value: stats.docsThisMonth.toLocaleString('es-ES'),
      sub: <DeltaBadge delta={stats.monthDelta} />,
      icon: Calendar,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
      title: 'Mes anterior',
      value: stats.docsLastMonth.toLocaleString('es-ES'),
      sub: 'Documentos procesados',
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: 'Importe total',
      value: stats.totalAmountThisMonth != null
        ? stats.totalAmountThisMonth.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        : '—',
      sub: 'Facturas este mes',
      icon: Euro,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(c => (
        <Card key={c.title} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{c.title}</p>
                <p className="text-2xl font-bold tracking-tight">{c.value}</p>
                <div className="text-xs text-muted-foreground">{c.sub}</div>
              </div>
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
