'use client'

import { UserButton } from '@clerk/nextjs'

interface Props {
  title: string
  actions?: React.ReactNode
}

export function AppHeader({ title, actions }: Props) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-4">
        {actions}
        <UserButton />
      </div>
    </header>
  )
}
