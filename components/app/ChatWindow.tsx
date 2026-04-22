'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Plus, AlertCircle, MessageSquare, Bot, User } from 'lucide-react'
import Link from 'next/link'
import { useChat } from '@/hooks/useChat'
import { MAX_MESSAGE_LENGTH } from '@/types/app'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const SUGGESTIONS = [
  '¿Cuál es la última factura de luz?',
  '¿Cuánto hemos gastado en suministros en total?',
  '¿Qué facturas hay del último trimestre?',
  'Dame un resumen de todos los documentos subidos',
  '¿Cuál es el proveedor con mayor gasto acumulado?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 140}ms` }} />
          ))}
        </span>
      </div>
    </div>
  )
}

interface Props {
  onClear?: () => void
}

export function ChatWindow({ onClear }: Props) {
  const { messages, isStreaming, error, sendMessage, clearChat, loadHistory } = useChat()
  const [input, setInput] = useState('')
  const [hasDocuments, setHasDocuments] = useState<boolean | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadHistory()
    fetch('/api/documents?limit=1&status=done')
      .then((r) => r.json())
      .then((d) => setHasDocuments((d.total ?? 0) > 0))
      .catch(() => setHasDocuments(null))
  }, [loadHistory])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleClear = useCallback(() => {
    clearChat(); onClear?.(); loadHistory()
  }, [clearChat, onClear, loadHistory])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_MESSAGE_LENGTH)
    setInput(val)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const showTyping = isStreaming && (
    messages.length === 0 ||
    messages[messages.length - 1]?.role !== 'assistant' ||
    messages[messages.length - 1]?.content === ''
  )

  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div className="flex flex-col h-full rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">Asistente documental</p>
            <p className="text-xs text-muted-foreground mt-0.5">Impulsado por Claude AI</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"
          onClick={handleClear} disabled={isStreaming}>
          <Plus className="h-3 w-3" />
          Nueva conversación
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 flex flex-col gap-4">
          {hasDocuments === false && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <span className="font-medium">Sin documentos.</span>{' '}
                Sube documentos primero para hacer preguntas.{' '}
                <Link href="/app/documents" className="underline font-medium">Ir a Documentos</Link>
              </AlertDescription>
            </Alert>
          )}

          {isEmpty && hasDocuments !== false && (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">¿Qué quieres saber sobre tus documentos?</p>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Haz clic en una sugerencia o escribe tu pregunta
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/30 transition-all text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex items-end gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              {/* Avatar */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5',
                msg.role === 'user' ? 'bg-primary' : 'bg-primary/10'
              )}>
                {msg.role === 'user'
                  ? <User className="h-3.5 w-3.5 text-primary-foreground" />
                  : <Bot className="h-3.5 w-3.5 text-primary" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                'max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm border'
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {showTyping && <TypingIndicator />}

          {error && (
            <div className="flex justify-center">
              <Badge variant="destructive" className="text-xs">{error}</Badge>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 shrink-0 bg-muted/10">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl min-h-[44px] max-h-[160px] text-sm py-3 focus-visible:ring-primary"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isStreaming}
            size="icon" className="h-11 w-11 rounded-xl shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
          {input.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>
    </div>
  )
}
