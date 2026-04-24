'use client'

import { useState, useEffect, useCallback } from 'react'
import { SignOutButton } from '@clerk/nextjs'
import { UsageMeter } from '@/components/app/UsageMeter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, CheckCircle, CreditCard, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { OrgPlan, SubscriptionStatus } from '@/types/database'
import { TRIAL_DOC_LIMIT, PRO_DOC_LIMIT } from '@/lib/stripe/constants'

interface OrgData {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  created_at: string
  subscription_status: SubscriptionStatus
  trial_docs_used: number
  current_period_end: string | null
}

interface SettingsData {
  org: OrgData
  user: { id: string; email: string; full_name: string | null; role: string }
  usage: { used: number; limit: number; plan: string }
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) return
      const json = await res.json() as SettingsData
      setData(json)
      setOrgName(json.org.name)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Error ${res.status}`)
      }
      setSaveMessage({ type: 'success', text: 'Nombre actualizado correctamente' })
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const body = await res.json() as { url?: string; error?: string }
      if (body.url) window.location.href = body.url
    } finally {
      setPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl animate-pulse">
        <div className="h-8 w-48 rounded bg-muted" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-6 flex flex-col gap-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  const plan = data?.org.plan ?? 'trial'
  const status = data?.org.subscription_status ?? 'trialing'
  const trialUsed = data?.org.trial_docs_used ?? 0
  const periodEnd = data?.org.current_period_end
    ? new Date(data.org.current_period_end).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-2xl font-semibold">Configuración</h2>

      {/* ── Suscripción ─────────────────────────────────────────────── */}
      <section className="rounded-xl border p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Suscripción</h3>
          {(plan === 'trial' || plan === 'free') && (
            <Badge variant="secondary">Prueba gratuita</Badge>
          )}
          {plan === 'pro' && status === 'active' && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Pro activo</Badge>
          )}
          {plan === 'pro' && status === 'past_due' && (
            <Badge variant="destructive">Pago pendiente</Badge>
          )}
          {(status === 'canceled') && (
            <Badge variant="outline" className="text-muted-foreground">Cancelado</Badge>
          )}
        </div>

        {/* Trial */}
        {(plan === 'trial' || plan === 'free') && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Documentos usados</span>
                <span className="font-medium">{trialUsed} / {TRIAL_DOC_LIMIT}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (trialUsed / TRIAL_DOC_LIMIT) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              El plan de prueba incluye {TRIAL_DOC_LIMIT} documentos. Suscríbete al Plan Pro para procesar hasta {PRO_DOC_LIMIT} documentos al mes.
            </p>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href="/app/upgrade">
                Suscribirse por 10 €/mes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Pro active */}
        {plan === 'pro' && status === 'active' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Plan Pro activo — hasta {PRO_DOC_LIMIT} documentos al mes</span>
            </div>
            {periodEnd && (
              <p className="text-sm text-muted-foreground">Próxima renovación: <span className="font-medium text-foreground">{periodEnd}</span></p>
            )}
            <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={openPortal} disabled={portalLoading}>
              <CreditCard className="h-4 w-4" />
              {portalLoading ? 'Abriendo portal…' : 'Gestionar suscripción'}
            </Button>
          </div>
        )}

        {/* Past due */}
        {plan === 'pro' && status === 'past_due' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>Tu suscripción tiene un pago pendiente. Actualiza tu método de pago para no perder el acceso.</span>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto gap-2" onClick={openPortal} disabled={portalLoading}>
              <CreditCard className="h-4 w-4" />
              {portalLoading ? 'Abriendo portal…' : 'Actualizar método de pago'}
            </Button>
          </div>
        )}

        {/* Canceled */}
        {status === 'canceled' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>Tu suscripción fue cancelada. Reactívala para volver a procesar documentos.</span>
            </div>
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href="/app/upgrade">
                Reactivar Plan Pro <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* ── Organización ────────────────────────────────────────────── */}
      <section className="rounded-xl border p-6 flex flex-col gap-4">
        <h3 className="font-medium">Organización</h3>

        <form onSubmit={handleSaveOrg} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="org-name">Nombre</label>
            <input
              id="org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              maxLength={100}
              required
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Identificador (slug)</label>
            <input
              type="text"
              value={data?.org.slug ?? ''}
              readOnly
              className="rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">El identificador no se puede cambiar.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || !orgName.trim() || orgName === data?.org.name}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* ── Uso ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border p-6 flex flex-col gap-4">
        <h3 className="font-medium">Uso este mes</h3>
        {data ? (
          <UsageMeter
            used={data.usage.used}
            limit={data.usage.limit}
            plan={data.org.plan}
            label="Documentos procesados este mes"
          />
        ) : (
          <div className="h-8 rounded bg-muted animate-pulse" />
        )}
      </section>

      {/* ── Cuenta ──────────────────────────────────────────────────── */}
      <section className="rounded-xl border p-6 flex flex-col gap-4">
        <h3 className="font-medium">Cuenta</h3>
        {data && (
          <div className="flex flex-col gap-2 text-sm">
            {data.user.full_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre</span>
                <span className="font-medium">{data.user.full_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{data.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rol</span>
              <span className="font-medium capitalize">{data.user.role}</span>
            </div>
          </div>
        )}
        <div className="pt-2 border-t">
          <SignOutButton>
            <button className="rounded-lg border px-4 py-2 text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 transition-colors">
              Cerrar sesión
            </button>
          </SignOutButton>
        </div>
      </section>
    </div>
  )
}
