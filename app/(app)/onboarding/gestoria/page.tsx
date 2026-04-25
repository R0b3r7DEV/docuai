'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Plus, Mail, Check, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { id: 1, title: 'Bienvenido al Panel de Gestoría', icon: Building2 },
  { id: 2, title: 'Añade tu primer cliente', icon: Plus },
  { id: 3, title: 'Todo listo', icon: Check },
]

export default function GestoriaOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [companyName, setCompanyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  const handleCreateClient = async () => {
    if (!companyName.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/gestoria/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Error al crear cliente')
      }
      setCreated(true)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12 flex flex-col gap-8">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              step >= s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5', step > s.id ? 'bg-primary' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">¡Bienvenido al Panel de Gestoría!</h2>
              <p className="text-muted-foreground mt-2">
                Tu suscripción Gestoría te permite gestionar múltiples empresas clientes desde un solo panel.
                Cada cliente tiene sus propios documentos y chat aislados. Tú lo ves todo.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Building2, text: 'Crea o invita empresas clientes' },
              { icon: Check, text: 'Cada cliente ve solo sus propios datos' },
              { icon: Mail, text: 'Invita por email con un enlace de activación' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => setStep(2)} className="w-full h-11 gap-2">
            Siguiente <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Add first client */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Añade tu primer cliente</h2>
            <p className="text-muted-foreground mt-2">
              Crea la primera empresa cliente directamente o puedes saltarte este paso y hacerlo después.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Nombre de la empresa</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Ej. Distribuciones García S.L."
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
              Saltar por ahora
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={!companyName.trim() || isCreating}
              className="flex-1 gap-2"
            >
              {isCreating ? <><Loader2 className="h-4 w-4 animate-spin" />Creando…</> : <>Crear cliente</>}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">¡Todo listo!</h2>
            <p className="text-muted-foreground mt-2">
              {created
                ? `Hemos creado "${companyName}". Puedes añadir más clientes desde tu panel de gestoría.`
                : 'Tu panel de gestoría está configurado. Añade clientes cuando quieras.'}
            </p>
          </div>
          <Button onClick={() => router.push('/gestoria')} className="h-11 px-8 gap-2">
            Ir al panel <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
