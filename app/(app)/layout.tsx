import type { Metadata } from 'next'
import { AppSidebar } from '@/components/app/AppSidebar'
import { AppHeader } from '@/components/app/AppHeader'
import { ImpersonationBanner } from '@/components/app/ImpersonationBanner'

export const metadata: Metadata = {
  title: { default: 'Aplicación', template: '%s | Lexia' },
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ImpersonationBanner />
        <AppHeader title="Lexia" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
