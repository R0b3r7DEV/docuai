import type { DocumentStatus, ExtractionCategory, ExtractionType } from './database'

// ============================================================
// Request / Response types para los Route Handlers
// ============================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  error: string
  code?: string
}

// GET /api/documents
export interface DocumentFilters {
  page?: number
  limit?: number
  status?: DocumentStatus
  type?: ExtractionType
  category?: ExtractionCategory
  dateFrom?: string
  dateTo?: string
  search?: string
}

// POST /api/documents/upload
export interface UploadResponse {
  id: string
  filename: string
  status: DocumentStatus
}

// GET /api/documents/[id]
export interface DocumentDetailResponse {
  document: import('./database').DocumentWithExtraction
  signedUrl: string
}

// POST /api/chat
export interface ChatRequest {
  message: string
  conversationId?: string
}

// GET /api/chat/history
export interface ChatHistoryParams {
  page?: number
  limit?: number
  before?: string
}

// GET /api/export
export interface ExportParams {
  dateFrom?: string
  dateTo?: string
  type?: ExtractionType
  category?: ExtractionCategory
}

export type SortDirection = 'asc' | 'desc'
export type SortColumn =
  | 'filename'
  | 'created_at'
  | 'status'
  | 'amount'
  | 'vendor'
  | 'issue_date'

export interface PaginationState {
  page: number
  limit: number
  total: number
}
