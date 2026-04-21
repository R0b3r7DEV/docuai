'use client'

import { useState } from 'react'
import { ChatWindow } from '@/components/app/ChatWindow'

export default function ChatPage() {
  // Key resets ChatWindow (and its useChat hook) when user clicks Nueva conversación
  const [chatKey, setChatKey] = useState(0)

  return (
    <div className="flex flex-col h-full gap-0">
      <ChatWindow key={chatKey} onClear={() => setChatKey((k) => k + 1)} />
    </div>
  )
}
