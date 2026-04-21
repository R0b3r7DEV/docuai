import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/supabase/storage'
import { inngest } from '@/inngest/client'
import { handleApiError, ValidationError, RateLimitError } from '@/lib/utils/errors'
import { validateMimeType, validateFileSize } from '@/lib/utils/validators'
import { getAuthenticatedUser } from '@/lib/utils/auth'

const UPLOAD_RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

/** Returns the MIME type inferred from the first bytes of the buffer, or null for text/plain. */
function detectMimeFromBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null

  // PDF: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf'
  }
  // PNG: \x89PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  // JPEG: \xFF\xD8\xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  // WebP: RIFF????WEBP
  if (buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp'
  }
  // text/plain has no magic bytes — signal with null
  return null
}

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    // Rate limit: max 20 uploads per hour per org
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .gte('created_at', windowStart)

    if ((count ?? 0) >= UPLOAD_RATE_LIMIT) {
      throw new RateLimitError('Límite de subidas alcanzado (20 archivos por hora). Inténtalo más tarde.')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) throw new ValidationError('No se proporcionó ningún archivo')

    if (!validateMimeType(file.type)) {
      throw new ValidationError(`Tipo de archivo no permitido: ${file.type}`)
    }
    if (!validateFileSize(file.size)) {
      throw new ValidationError('El archivo supera el límite de 10 MB')
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Magic bytes validation — text/plain is excluded (no signature)
    if (file.type !== 'text/plain') {
      const detectedMime = detectMimeFromBytes(buffer)
      if (detectedMime === null || detectedMime !== file.type) {
        throw new ValidationError(
          `El contenido del archivo no coincide con su extensión (${file.type}). Sube un archivo válido.`
        )
      }
    }

    const documentId = crypto.randomUUID()
    const storagePath = `${user.organization_id}/${documentId}/${file.name}`

    await uploadToStorage(storagePath, buffer, file.type)

    const { data: document, error } = await supabaseServer
      .from('documents')
      .insert({
        id: documentId,
        organization_id: user.organization_id,
        uploaded_by: user.id,
        filename: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !document) throw error ?? new Error('Error al crear el documento')

    await inngest.send({ name: 'docuai/document.uploaded', data: { documentId: document.id } })

    return NextResponse.json(
      { documentId: document.id, filename: document.filename, status: document.status },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
