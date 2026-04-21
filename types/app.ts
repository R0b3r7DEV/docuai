// Tipos de dominio compartidos entre cliente y servidor

export interface UploadProgress {
  filename: string
  progress: number // 0-100
  status: 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  documentId?: string
}

export interface ChatStreamChunk {
  type: 'delta' | 'done' | 'error'
  content?: string
  error?: string
}

export interface ExtractionDisplay {
  label: string
  value: string | number | null
  type: 'text' | 'currency' | 'date' | 'badge'
}

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
] as const

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]

export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_CHAT_CONTEXT_DOCS = 60
export const MAX_CHAT_HISTORY_TURNS = 20
export const MAX_MESSAGE_LENGTH = 2000
