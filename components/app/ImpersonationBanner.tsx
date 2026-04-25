'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Eye, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateImpersonationToken } from '@/lib/gestoria/impersonate'

// Reads the ?impersonate= token from URL and shows an orange banner
function ImpersonationBannerInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('impersonate')
  const [clientName, setClientName] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    // Store token in sessionStorage so it persists across navigation
    sessionStorage.setItem('impersonate_token', token)
    sessionStorage.setItem('impersonate_active', '1')
    // Remove from URL without re-render
    const url = new URL(window.location.href)
    url.searchParams.delete('impersonate')
    window.history.replaceState({}, '', url.toString())
  }, [token])

  // Check sessionStorage for active impersonation
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isActive = sessionStorage.getItem('impersonate_active') === '1'
    const storedName = sessionStorage.getItem('impersonate_client_name')
    setActive(isActive)
    if (storedName) setClientName(storedName)
  }, [token])

  // Store client name from impersonate API response (passed via URL param client_name)
  useEffect(() => {
    const name = searchParams.get('client_name')
    if (name) {
      sessionStorage.setItem('impersonate_client_name', name)
      setClientName(name)
    }
  }, [searchParams])

  if (!active) return null

  const handleExit = () => {
    sessionStorage.removeItem('impersonate_token')
    sessionStorage.removeItem('impersonate_active')
    sessionStorage.removeItem('impersonate_client_name')
    router.push('/gestoria')
  }

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-amber-500 text-white text-sm shrink-0">
      <Eye className="h-4 w-4 shrink-0" />
      <span className="flex-1 font-medium">
        Viendo como cliente{clientName ? `: ${clientName}` : ''} — Los cambios afectan a esta empresa
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-white hover:bg-amber-600 hover:text-white gap-1"
        onClick={handleExit}
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a mi panel
      </Button>
    </div>
  )
}

export function ImpersonationBanner() {
  return (
    <Suspense>
      <ImpersonationBannerInner />
    </Suspense>
  )
}
