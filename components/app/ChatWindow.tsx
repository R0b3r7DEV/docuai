'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Plus, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import { useChat } from '@/hooks/useChat'
import { MAX_MESSAGE_LENGTH } from '@/types/app'
import { cn } from '@/lib/utils/cn'

const SUGGESTIONS = [
  '¿Cuál es la última factura de luz?',
  '¿Cuánto hemos gastado en suministros en total?',
  '¿Qué facturas hay del último trimestre?',
  'Dame un resumen de todos los documentos subidos',
  '¿Cuál es el proveedor con mayor gasto acumulado?',
]

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
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

  // Load history + check if org has documents
  useEffect(() => {
    loadHistory()

    fetch('/api/documents?limit=1&status=done')
      .then((r) => r.json())
      .then((d) => setHasDocuments((d.total ?? 0) > 0))
      .catch(() => setHasDocuments(null))
  }, [loadHistory])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleClear = useCallback(() => {
    clearChat()
    onClear?.()
    loadHistory() // mark historyLoaded = false so next time it reloads
  }, [clearChat, onClear, loadHistory])

  // After clearChat the ref is reset but we need to re-trigger the effect
  // The component remounts automatically if key changes — handled by parent via onClear

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_MESSAGE_LENGTH)
    setInput(val)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const showTypingIndicator = isStreaming && (
    messages.length === 0 ||
    messages[messages.length - 1]?.role !== 'assistant' ||
    messages[messages.length - 1]?.content === ''
  )

  const isEmpty = messages.length === 0 && !isStreaming

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
        <span className="font-semibold text-sm">Asistente documental</span>
        <button
          onClick={handleClear}
          disabled={isStreaming}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva conversación
        </button>
      </div>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-h-0">

        {/* No-documents warning */}
        {hasDocuments === false && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Sin documentos</p>
              <p className="text-amber-700 mt-0.5">
                Sube documentos primero para poder hacer preguntas.{' '}
                <Link href="/app/documents" className="underline hover:no-underline">
                  Ir a Documentos
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Suggestions (empty state) */}
        {isEmpty && hasDocuments !== false && (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">¿Qué quieres saber sobre tus documentos?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Haz clic en una sugerencia o escribe tu pregunta
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words',
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTypingIndicator && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <p className="text-xs text-red-600 bg-red-50 rounded-full px-3 py-1.5">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 placeholder:text-muted-foreground overflow-y-auto"
            style={{ minHeight: '44px', maxHeight: '160px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
            title="Enviar (Enter)"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-right">
          {input.length}/{MAX_MESSAGE_LENGTH}
        </p>
      </div>
    </div>
  )
}
