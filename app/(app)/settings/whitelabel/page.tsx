'use client'

import { useEffect, useState, useCallback } from 'react'
import { Palette, Globe, Eye, Save, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { WhitelabelConfig } from '@/types/database'

interface FormState {
  brand_name: string
  primary_color: string
  primary_dark: string
  custom_domain: string
  support_email: string
  hide_docuai_branding: boolean
  custom_login_message: string
  custom_footer_text: string
}

const DEFAULTS: FormState = {
  brand_name: '',
  primary_color: '#1D9E75',
  primary_dark: '#085041',
  custom_domain: '',
  support_email: '',
  hide_docuai_branding: false,
  custom_login_message: '',
  custom_footer_text: '',
}

export default function WhitelabelSettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [config, setConfig] = useState<WhitelabelConfig | null>(null)
  const [plan, setPlan] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [domainVerifying, setDomainVerifying] = useState(false)
  const [domainStatus, setDomainStatus] = useState<{ verified: boolean; instructions: string[] } | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  const load = useCallback(async () => {
    const [cfgRes, settingsRes] = await Promise.all([
      fetch('/api/whitelabel/config'),
      fetch('/api/settings'),
    ])
    const cfgData = await cfgRes.json()
    const settingsData = await settingsRes.json()

    setPlan(settingsData.org?.plan ?? '')

    if (cfgData.config) {
      setConfig(cfgData.config)
      setForm({
        brand_name: cfgData.config.brand_name ?? '',
        primary_color: cfgData.config.primary_color ?? '#1D9E75',
        primary_dark: cfgData.config.primary_dark ?? '#085041',
        custom_domain: cfgData.config.custom_domain ?? '',
        support_email: cfgData.config.support_email ?? '',
        hide_docuai_branding: cfgData.config.hide_docuai_branding ?? false,
        custom_login_message: cfgData.config.custom_login_message ?? '',
        custom_footer_text: cfgData.config.custom_footer_text ?? '',
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Live preview: apply CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty('--brand', form.primary_color)
    document.documentElement.style.setProperty('--brand-dark', form.primary_dark)
  }, [form.primary_color, form.primary_dark])

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/whitelabel/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          custom_domain: form.custom_domain || null,
          support_email: form.support_email || null,
          custom_login_message: form.custom_login_message || null,
          custom_footer_text: form.custom_footer_text || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      setConfig(data.config)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File, type: 'logo' | 'favicon') => {
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const res = await fetch('/api/whitelabel/config/logo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imagen')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!form.custom_domain) return
    setDomainVerifying(true)
    setDomainStatus(null)
    try {
      const res = await fetch('/api/whitelabel/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: form.custom_domain }),
      })
      const data = await res.json()
      setDomainStatus({ verified: data.verified, instructions: data.instructions ?? [] })
    } finally {
      setDomainVerifying(false)
    }
  }

  const isWlPlan = plan === 'whitelabel' || plan === 'whitelabel_pro'
  const isWlPro = plan === 'whitelabel_pro'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isWlPlan) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">White-Label no disponible</h2>
        <p className="text-muted-foreground">Esta función requiere el plan White-Label o White-Label Pro.</p>
        <Button asChild variant="default">
          <a href="/app/upgrade">Ver planes</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración White-Label</h1>
          <p className="text-muted-foreground text-sm mt-1">Personaliza la apariencia de la plataforma para tus clientes</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Settings column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Brand */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" /> Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre de la marca</Label>
                <Input value={form.brand_name} onChange={e => set('brand_name', e.target.value)} placeholder="Mi Gestoría" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Color primario</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={e => set('primary_color', e.target.value)}
                      className="h-9 w-10 rounded border cursor-pointer"
                    />
                    <Input value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="font-mono text-xs" maxLength={7} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Color oscuro</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={form.primary_dark}
                      onChange={e => set('primary_dark', e.target.value)}
                      className="h-9 w-10 rounded border cursor-pointer"
                    />
                    <Input value={form.primary_dark} onChange={e => set('primary_dark', e.target.value)} className="font-mono text-xs" maxLength={7} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Logo (PNG/SVG, máx 2 MB)</Label>
                  <div className="flex items-center gap-2">
                    {config?.brand_logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={config.brand_logo_url} alt="Logo" className="h-8 w-auto object-contain rounded border" />
                    )}
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span><Upload className="h-3.5 w-3.5 mr-1.5" />Subir logo</span>
                      </Button>
                      <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f, 'logo') }} />
                    </label>
                    {logoUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Favicon (ICO/PNG 32×32)</Label>
                  <div className="flex items-center gap-2">
                    {config?.brand_favicon_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={config.brand_favicon_url} alt="Favicon" className="h-8 w-8 object-contain rounded border" />
                    )}
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span><Upload className="h-3.5 w-3.5 mr-1.5" />Subir favicon</span>
                      </Button>
                      <input type="file" accept="image/png,image/x-icon,image/vnd.microsoft.icon" className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f, 'favicon') }} />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" /> Dominio personalizado
                {!isWlPro && <Badge variant="secondary" className="text-xs">Solo White-Label Pro</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Dominio</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.custom_domain}
                    onChange={e => set('custom_domain', e.target.value)}
                    placeholder="app.migestoria.es"
                    disabled={!isWlPro}
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" onClick={handleVerifyDomain} disabled={!form.custom_domain || !isWlPro || domainVerifying}>
                    {domainVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                  </Button>
                </div>
              </div>

              {domainStatus && (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {domainStatus.verified
                      ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">Dominio activo</span></>
                      : <><XCircle className="h-4 w-4 text-amber-500" /><span className="text-sm text-amber-600 font-medium">Pendiente de configuración</span></>}
                  </div>
                  {domainStatus.instructions.length > 0 && (
                    <ol className="text-xs text-muted-foreground space-y-1">
                      {domainStatus.instructions.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ol>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalización */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Personalización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ocultar branding de DocuAI</Label>
                  <p className="text-xs text-muted-foreground">Elimina "Powered by DocuAI" de la interfaz</p>
                </div>
                <Switch
                  checked={form.hide_docuai_branding}
                  onCheckedChange={v => set('hide_docuai_branding', v)}
                  disabled={!isWlPro}
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label>Mensaje en la página de login</Label>
                <Input value={form.custom_login_message} onChange={e => set('custom_login_message', e.target.value)} placeholder="Bienvenido a Mi Gestoría" maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label>Texto del footer</Label>
                <Input value={form.custom_footer_text} onChange={e => set('custom_footer_text', e.target.value)} placeholder="© 2025 Mi Gestoría" maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label>Email de soporte</Label>
                <Input type="email" value={form.support_email} onChange={e => set('support_email', e.target.value)} placeholder="soporte@migestoria.es" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live preview column */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" /> Preview en vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden shadow-sm" style={{ fontSize: '11px' }}>
                {/* Sidebar preview */}
                <div className="flex" style={{ height: 220 }}>
                  <div className="w-32 border-r bg-muted/30 flex flex-col p-2 gap-1">
                    {/* Logo area */}
                    <div className="flex items-center gap-1.5 mb-2 py-1 border-b">
                      {config?.brand_logo_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={config.brand_logo_url} alt="" className="h-5 w-auto object-contain" />
                        : (
                          <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{ backgroundColor: form.primary_color }}>
                            <span className="text-white text-[8px] font-bold">D</span>
                          </div>
                        )}
                      <span className="font-bold truncate">{form.brand_name || 'Mi Marca'}</span>
                    </div>
                    {['Dashboard', 'Documentos', 'Chat IA'].map(item => (
                      <div key={item} className="flex items-center gap-1.5 px-1.5 py-1 rounded text-muted-foreground">
                        <div className="w-2 h-2 rounded-sm bg-muted-foreground/40" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-2 space-y-1.5">
                    <div className="h-5 rounded flex items-center px-2 text-[10px] font-medium text-white"
                      style={{ backgroundColor: form.primary_color }}>
                      Subir documento
                    </div>
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                    <div className="mt-2 p-1.5 rounded border text-[9px] text-muted-foreground"
                      style={{ borderColor: form.primary_color + '40', backgroundColor: form.primary_color + '0d' }}>
                      Procesado con IA ✓
                    </div>
                  </div>
                </div>
                {/* Footer preview */}
                <div className="border-t px-2 py-1 bg-muted/20 text-[9px] text-muted-foreground text-center">
                  {form.custom_footer_text || (!form.hide_docuai_branding ? 'Powered by DocuAI' : '')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
