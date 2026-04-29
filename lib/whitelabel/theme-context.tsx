'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { WhitelabelConfig } from '@/types/database'

interface ThemeContextValue {
  brandName: string
  primaryColor: string
  primaryDark: string
  logoUrl: string | null
  faviconUrl: string | null
  isWhitelabel: boolean
  hideDocuaiBranding: boolean
  supportEmail: string | null
  footerText: string | null
}

const defaults: ThemeContextValue = {
  brandName: 'Lexia',
  primaryColor: '#1D9E75',
  primaryDark: '#085041',
  logoUrl: null,
  faviconUrl: null,
  isWhitelabel: false,
  hideDocuaiBranding: false,
  supportEmail: null,
  footerText: null,
}

const ThemeContext = createContext<ThemeContextValue>(defaults)

export function ThemeProvider({
  config,
  children,
}: {
  config: WhitelabelConfig | null
  children: ReactNode
}) {
  const value: ThemeContextValue = config
    ? {
        brandName: config.brand_name,
        primaryColor: config.primary_color,
        primaryDark: config.primary_dark,
        logoUrl: config.brand_logo_url,
        faviconUrl: config.brand_favicon_url,
        isWhitelabel: true,
        hideDocuaiBranding: config.hide_brand,
        supportEmail: config.support_email,
        footerText: config.custom_footer_text,
      }
    : defaults

  useEffect(() => {
    if (!config) return
    const root = document.documentElement
    root.style.setProperty('--brand', config.primary_color)
    root.style.setProperty('--brand-dark', config.primary_dark)
    // Derive a light tint: use the color at 10% opacity via CSS
    root.style.setProperty('--brand-light', config.primary_color + '1a')
  }, [config])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
