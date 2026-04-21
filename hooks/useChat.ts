'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '@/types/database'

interface UseChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
  loadHistory: () => Promise<void>
}

function makeTempId() {
  return `temp-${crypto.randomUUID()}`
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const historyLoaded = useRef(false)

  const loadHistory = useCallback(async () => {
    if (historyLoaded.current) return
    historyLoaded.current = true
    try {
      const res = await fetch('/api/chat/history?pageSize=50')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.data) && data.data.length > 0) {
        setMessages(data.data as ChatMessage[])
      }
    } catch {
      // Non-fatal: start with empty history
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming || !content.trim()) return
    setError(null)
    setIsStreaming(true)

    const userMsg: ChatMessage = {
      id: makeTempId(),
      organization_id: '',
      user_id: '',
      role: 'user',
      content,
      context_doc_ids: null,
      created_at: new Date().toISOString(),
    }
    const botId = makeTempId()
    const botMsg: ChatMessage = {
      id: botId,
      organization_id: '',
      user_id: '',
      role: 'assistant',
      content: '',
      context_doc_ids: null,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg, botMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error ?? `Error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? '' // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break

          try {
            const parsed = JSON.parse(raw)
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, content: m.content + parsed.text } : m
                )
              )
            } else if (parsed.error) {
              throw new Error(parsed.error)
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      setMessages((prev) => prev.filter((m) => m.id !== botId))
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    historyLoaded.current = false
  }, [])

  return { messages, isStreaming, error, sendMessage, clearChat, loadHistory }
}
