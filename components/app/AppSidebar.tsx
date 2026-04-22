'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, MessageSquare, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/app/documents', label: 'Documentos', icon: FileText },
  { href: '/app/chat', label: 'Chat IA', icon: MessageSquare },
  { href: '/app/settings', label: 'Configuración', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b shrink-0">
        <Link href="/app/documents" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">DocuAI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
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
      </nav>

      {/* Footer badge */}
      <div className="p-3 border-t shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs text-sidebar-foreground/70">Claude AI</span>
        </div>
      </div>
    </aside>
  )
}
