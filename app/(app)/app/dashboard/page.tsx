'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsOverview } from '@/components/app/StatsOverview'
import { DocsByTypeChart } from '@/components/app/charts/DocsByTypeChart'
import { SpendingByMonthChart } from '@/components/app/charts/SpendingByMonthChart'
import { TopVendorsChart } from '@/components/app/charts/TopVendorsChart'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsData {
  totalDocs: number
  docsThisMonth: number
  docsLastMonth: number
  monthDelta: number | null
  totalAmountThisMonth: number | null
  topVendors: { vendor: string; count: number; amount: number }[]
  docsByType: { type: string; count: number }[]
  monthlyTrend: { month: string; docs: number; amount: number }[]
  plan: string
  orgName: string
}

function GreetingText({ name }: { name?: string | null }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting}{name ? `, ${name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">Aquí tienes un resumen de tu actividad</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <GreetingText name={user?.firstName ?? user?.fullName} />
        <Button asChild size="sm">
          <Link href="/app/documents">
            <FileText className="mr-2 h-4 w-4" />
            Subir documento
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <StatsOverview stats={stats} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documentos por tipo</CardTitle>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[220px]" /> : (
              <DocsByTypeChart data={stats?.docsByType ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actividad mensual</CardTitle>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[220px]" /> : (
              <SpendingByMonthChart data={stats?.monthlyTrend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top proveedores</CardTitle>
            <p className="text-xs text-muted-foreground">Por número de documentos</p>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[220px]" /> : (
              <TopVendorsChart data={stats?.topVendors ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Accesos rápidos</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/app/documents', label: 'Todos los documentos', sub: 'Ver y gestionar tus documentos' },
          { href: '/app/upgrade', label: 'Mejorar plan', sub: 'Desbloquea más funcionalidades' },
          { href: '/app/settings', label: 'Configuración', sub: 'Perfil y ajustes de empresa' },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent/50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {stats?.plan && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Plan actual:</span>
          <Badge variant="secondary" className="text-xs capitalize">{stats.plan}</Badge>
          {(stats.plan === 'trial' || stats.plan === 'free') && (
            <Link href="/app/upgrade" className="text-indigo-500 hover:underline">Mejorar plan</Link>
          )}
        </div>
      )}
    </div>
  )
}
