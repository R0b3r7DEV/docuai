'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, X, Upload, FileSearch, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface Props {
  totalDocs: number
  hasDoneDocs: boolean
}

const DISMISSED_KEY = 'lexia_onboarding_dismissed'

export function OnboardingChecklist({ totalDocs, hasDoneDocs }: Props) {
  const [dismissed, setDismissed] = useState(true) // start hidden, read from storage
  const [chatUsed, setChatUsed] = useState(false)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1')
    setChatUsed(localStorage.getItem('lexia_chat_used') === '1')
  }, [])

  const steps = [
    {
      icon: Upload,
      label: 'Sube tu primer documento',
      done: totalDocs > 0,
      href: '/app/documents',
    },
    {
      icon: FileSearch,
      label: 'Revisa los datos extraídos por la IA',
      done: hasDoneDocs,
      href: '/app/documents',
    },
    {
      icon: MessageSquare,
      label: 'Haz una pregunta al asistente',
      done: chatUsed,
      href: '/app/chat',
    },
  ]

  const allDone = steps.every(s => s.done)
  const completedCount = steps.filter(s => s.done).length

  if (dismissed || allDone) return null

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Primeros pasos</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">{completedCount} de {steps.length} completados</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, '1')
            setDismissed(true)
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pb-4">
        {steps.map(({ icon: Icon, label, done, href }) => (
          <Link
            key={label}
            href={done ? '#' : href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              done
                ? 'text-muted-foreground cursor-default'
                : 'hover:bg-accent cursor-pointer'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
              done ? 'bg-primary/15 text-primary' : 'border-2 border-muted-foreground/30'
            )}>
              {done && <Check className="h-3 w-3" />}
              {!done && <Icon className="h-2.5 w-2.5 text-muted-foreground/50" />}
            </div>
            <span className={cn(done && 'line-through')}>{label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
