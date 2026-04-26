'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check, Palette, Globe, Users, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { id: 1, label: 'Tu marca', icon: Palette },
  { id: 2, label: 'Colores', icon: Sparkles },
  { id: 3, label: 'Dominio', icon: Globe },
  { id: 4, label: 'Primer cliente', icon: Users },
]

export default function WhitelabelOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    brand_name: '',
    primary_color: '#1D9E75',
    primary_dark: '#085041',
    custom_domain: '',
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleFinish = async () => {
    setSaving(true)
    try {
      await fetch('/api/whitelabel/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: form.brand_name || 'Mi Gestoría',
          primary_color: form.primary_color,
          primary_dark: form.primary_dark,
          custom_domain: form.custom_domain || null,
        }),
      })
      router.push('/app/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const canNext = () => {
    if (step === 1) return form.brand_name.trim().length >= 2
    return true
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors',
                step > s.id ? 'bg-primary text-primary-foreground' :
                step === s.id ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('w-12 h-0.5 mx-1 transition-colors', step > s.id ? 'bg-primary' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 pb-8 px-8 space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">¿Cómo se llama tu marca?</h2>
                  <p className="text-sm text-muted-foreground">Este nombre verán tus clientes en la plataforma</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Nombre de la marca</Label>
                  <Input
                    autoFocus
                    value={form.brand_name}
                    onChange={e => set('brand_name', e.target.value)}
                    placeholder="Mi Gestoría, S.L."
                    className="text-center text-lg h-12"
                    onKeyDown={e => { if (e.key === 'Enter' && canNext()) setStep(2) }}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Elige tus colores</h2>
                  <p className="text-sm text-muted-foreground">El color principal que verán tus clientes</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Color principal</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.primary_color} onChange={e => {
                        set('primary_color', e.target.value)
                        document.documentElement.style.setProperty('--brand', e.target.value)
                      }} className="h-10 w-12 rounded cursor-pointer border" />
                      <Input value={form.primary_color} onChange={e => set('primary_color', e.target.value)} className="font-mono text-sm" maxLength={7} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color oscuro</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.primary_dark} onChange={e => {
                        set('primary_dark', e.target.value)
                        document.documentElement.style.setProperty('--brand-dark', e.target.value)
                      }} className="h-10 w-12 rounded cursor-pointer border" />
                      <Input value={form.primary_dark} onChange={e => set('primary_dark', e.target.value)} className="font-mono text-sm" maxLength={7} />
                    </div>
                  </div>
                </div>
                {/* Mini preview */}
                <div className="rounded-lg p-4 text-sm space-y-2" style={{ backgroundColor: form.primary_color + '15', borderLeft: `3px solid ${form.primary_color}` }}>
                  <p className="font-medium" style={{ color: form.primary_color }}>Vista previa: {form.brand_name || 'Mi Gestoría'}</p>
                  <div className="h-7 rounded text-xs flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: form.primary_color }}>Subir documento</div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Dominio personalizado</h2>
                  <p className="text-sm text-muted-foreground">Opcional — solo en White-Label Pro. Puedes configurarlo después.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Tu dominio (ej: app.migestoria.es)</Label>
                  <Input value={form.custom_domain} onChange={e => set('custom_domain', e.target.value)} placeholder="app.migestoria.es" className="font-mono" />
                </div>
                <p className="text-xs text-muted-foreground text-center">Puedes saltarte este paso y configurarlo más adelante en Ajustes → White-Label</p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">¡Todo listo!</h2>
                <p className="text-muted-foreground text-sm">Tu plataforma white-label está configurada. Ahora puedes invitar a tu primer cliente o ir directamente al panel.</p>
                <div className="flex gap-3 justify-center pt-2">
                  <Button variant="outline" onClick={() => router.push('/gestoria/invitations')}>
                    <Users className="h-4 w-4 mr-2" /> Invitar cliente
                  </Button>
                  <Button onClick={handleFinish} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Ir a mi panel
                  </Button>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Atrás
                </Button>
                <Button onClick={() => {
                  if (step === 3) handleFinish().then(() => setStep(4))
                  else setStep(s => s + 1)
                }} disabled={!canNext() || saving}>
                  {step === 3 ? (saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando…</> : 'Guardar y continuar') : 'Siguiente'}
                  {step < 3 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
