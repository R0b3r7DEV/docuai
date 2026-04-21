'use client'

import { useState, useEffect, useCallback } from 'react'
import { SignOutButton } from '@clerk/nextjs'
import { UsageMeter } from '@/components/app/UsageMeter'
import type { OrgPlan } from '@/types/database'

interface SettingsData {
  org: { id: string; name: string; slug: string; plan: OrgPlan; created_at: string }
  user: { id: string; email: string; full_name: string | null; role: string }
  usage: { used: number; limit: number; plan: string }
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratis',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl animate-pulse">
        <div className="h-8 w-48 rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-6 flex flex-col gap-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-2xl font-semibold">Configuración</h2>

      {/* Organización */}
      <section className="rounded-lg border p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Organización</h3>
          {data && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {PLAN_LABELS[data.org.plan] ?? data.org.plan}
            </span>
          )}
        </div>

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

      {/* Uso */}
      <section className="rounded-lg border p-6 flex flex-col gap-4">
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

      {/* Cuenta */}
      <section className="rounded-lg border p-6 flex flex-col gap-4">
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
