'use client'

import { useTheme } from '@/lib/whitelabel/theme-context'
import { LifeBuoy } from 'lucide-react'

export function SupportLink() {
  const { supportEmail, isWhitelabel } = useTheme()

  const href = supportEmail
    ? `mailto:${supportEmail}`
    : 'mailto:hola@docuai.es'

  const label = isWhitelabel && supportEmail ? 'Contactar soporte' : 'Soporte DocuAI'

  return (
    <a
      href={href}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <LifeBuoy className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}
