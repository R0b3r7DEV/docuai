'use client'

import { UserButton } from '@clerk/nextjs'

interface Props {
  title: string
  actions?: React.ReactNode
}

export function AppHeader({ title, actions }: Props) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-base tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
      </div>
    </header>
  )
}
