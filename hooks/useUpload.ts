'use client'

import { useState } from 'react'
import type { UploadProgress } from '@/types/app'

interface UseUploadReturn {
  uploads: UploadProgress[]
  uploadFile: (file: File) => Promise<void>
  clearCompleted: () => void
}

export function useUpload(onComplete?: (documentId: string) => void): UseUploadReturn {
  const [uploads, setUploads] = useState<UploadProgress[]>([])

  const updateUpload = (filename: string, update: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((u) => (u.filename === filename ? { ...u, ...update } : u))
    )
  }

  const uploadFile = async (file: File) => {
    const entry: UploadProgress = { filename: file.name, progress: 0, status: 'uploading' }
    setUploads((prev) => [...prev, entry])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          updateUpload(file.name, { progress: Math.round((e.loaded / e.total) * 100) })
        }
      }

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status }))
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', '/api/documents/upload')
        xhr.send(formData)
      })

      if (!response.ok) throw new Error('Upload failed')
      const { id } = await response.json()
      updateUpload(file.name, { status: 'processing', progress: 100, documentId: id })
      onComplete?.(id)
    } catch (err) {
      updateUpload(file.name, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error al subir',
      })
    }
  }

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading' || u.status === 'processing'))
  }

  return { uploads, uploadFile, clearCompleted }
}
