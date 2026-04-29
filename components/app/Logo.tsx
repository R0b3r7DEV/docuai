'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useTheme } from '@/lib/whitelabel/theme-context'

export function Logo() {
  const { brandName, logoUrl } = useTheme()

  return (
    <Link href="/app/dashboard" className="flex items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={brandName} height={32} className="h-8 w-auto object-contain" />
      ) : (
        <>
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base tracking-tight">
            <span style={{ fontWeight: 500 }}>Lex</span><span style={{ fontWeight: 300 }}>ia</span>
          </span>
        </>
      )}
    </Link>
  )
}
