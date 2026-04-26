'use client'

import { useTheme } from '@/lib/whitelabel/theme-context'

export function AppFooter() {
  const { hideDocuaiBranding, footerText, isWhitelabel } = useTheme()

  if (isWhitelabel && hideDocuaiBranding && !footerText) return null

  return (
    <div className="px-3 py-2 text-[11px] text-muted-foreground text-center">
      {footerText
        ? footerText
        : !hideDocuaiBranding
          ? 'Powered by DocuAI'
          : null}
    </div>
  )
}
