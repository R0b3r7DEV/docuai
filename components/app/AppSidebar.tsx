'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FileText, MessageSquare, Settings, Sparkles,
  Building2, Users, Mail, LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface OrgInfo {
  org_type: 'empresa' | 'gestoria'
  gestoria_name?: string | null
}

const mainNavItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/documents', label: 'Documentos', icon: FileText },
  { href: '/app/chat', label: 'Chat IA', icon: MessageSquare },
  { href: '/app/settings', label: 'Configuración', icon: Settings },
]

const gestoriaNavItems = [
  { href: '/gestoria', label: 'Panel Gestoría', icon: LayoutDashboard },
  { href: '/gestoria/clients', label: 'Clientes', icon: Users },
  { href: '/gestoria/invitations', label: 'Invitaciones', icon: Mail },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setOrgInfo({
          org_type: data.org?.org_type ?? 'empresa',
          gestoria_name: data.org?.gestoria_name ?? null,
        })
      })
      .catch(() => null)
  }, [])

  const isGestoria = orgInfo?.org_type === 'gestoria'
  const isClientManaged = orgInfo?.org_type === 'empresa' && orgInfo.gestoria_name

  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b shrink-0">
        <Link href="/app/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">DocuAI</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'opacity-100' : 'opacity-70')} />
              {label}
            </Link>
          )
        })}

        {isGestoria && (
          <>
            <div className="mt-4 mb-1.5 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Gestoría</p>
            </div>
            {gestoriaNavItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'opacity-100' : 'opacity-70')} />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t shrink-0 flex flex-col gap-2">
        {isClientManaged && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
            <Building2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-700 truncate leading-tight">
              Gestionado por {orgInfo!.gestoria_name}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs text-sidebar-foreground/70">Claude AI</span>
        </div>
      </div>
    </aside>
  )
}
