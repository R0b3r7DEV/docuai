'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Building2 } from 'lucide-react'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddClientModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugManual && name) setSlug(slugify(name))
    if (!name) setSlug('')
  }, [name, slugManual])

  const handleClose = () => {
    setName(''); setSlug(''); setSlugManual(false); setError(null); onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gestoria/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: name, slug }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      onCreated()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Añadir empresa cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company-name">Nombre de la empresa</Label>
            <Input
              id="company-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Distribuciones García S.L."
              required
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Identificador (slug)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="distribuciones-garcia"
              pattern="[a-z0-9-]+"
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">Solo minúsculas, números y guiones.</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !slug.trim()}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Creando…</> : 'Crear empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
