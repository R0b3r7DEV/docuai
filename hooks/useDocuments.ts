'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DocumentWithExtraction } from '@/types/database'
import type { DocumentFilters, PaginatedResponse, PaginationState } from '@/types/api'

interface UseDocumentsReturn {
  documents: DocumentWithExtraction[]
  isLoading: boolean
  error: string | null
  pagination: PaginationState
  filters: DocumentFilters
  setFilters: (filters: DocumentFilters) => void
  refresh: () => void
  deleteDocument: (id: string) => Promise<void>
}

const POLL_INTERVAL_MS = 5000

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<DocumentWithExtraction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DocumentFilters>({ page: 1, limit: 20 })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchDocuments = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v))
      })
      const res = await fetch(`/api/documents?${params}`)
      if (!res.ok) throw new Error('Error al cargar documentos')
      const data: PaginatedResponse<DocumentWithExtraction> = await res.json()
      setDocuments(data.data)
      setPagination({ page: data.page, limit: data.limit, total: data.total })

      // Polling: only active when documents are in-flight
      const hasInFlight = data.data.some(
        (d) => d.status === 'pending' || d.status === 'processing'
      )
      if (hasInFlight && !intervalRef.current) {
        // eslint-disable-next-line react-hooks/immutability
        intervalRef.current = setInterval(() => { void fetchDocuments(false) }, POLL_INTERVAL_MS)
      } else if (!hasInFlight && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void fetchDocuments()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fetchDocuments])

  const deleteDocument = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    await fetchDocuments()
  }

  return {
    documents,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    refresh: () => { void fetchDocuments() },
    deleteDocument,
  }
}
