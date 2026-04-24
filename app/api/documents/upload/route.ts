export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { uploadToStorage } from '@/lib/supabase/storage'
import { inngest } from '@/inngest/client'
import { handleApiError, ValidationError } from '@/lib/utils/errors'
import { validateMimeType, validateFileSize } from '@/lib/utils/validators'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { checkDocumentLimit, incrementTrialDocs } from '@/lib/stripe/limits'

const UPLOAD_RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000

function detectMimeFromBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return 'application/pdf'
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    // ── Document limit check (trial / pro) ─────────────────────────────
    const limitResult = await checkDocumentLimit(user.organization_id)
    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          error: 'límite_alcanzado',
          message: limitResult.reason ?? 'Has alcanzado el límite de documentos',
          upgrade_url: '/app/upgrade',
          used: limitResult.used,
          limit: limitResult.limit,
          plan: limitResult.plan,
        },
        { status: 403 }
      )
    }

    // ── Rate limit anti-abuse ───────────────────────────────────────────
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .gte('created_at', windowStart)

    if ((count ?? 0) >= UPLOAD_RATE_LIMIT) {
      return NextResponse.json(
        { error: 'límite_alcanzado', message: 'Límite de subidas alcanzado (20/hora). Inténtalo más tarde.', upgrade_url: '/app/upgrade' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) throw new ValidationError('No se proporcionó ningún archivo')

    if (!validateMimeType(file.type)) throw new ValidationError(`Tipo de archivo no permitido: ${file.type}`)
    if (!validateFileSize(file.size)) throw new ValidationError('El archivo supera el límite de 10 MB')

    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type !== 'text/plain') {
      const detectedMime = detectMimeFromBytes(buffer)
      if (detectedMime === null || detectedMime !== file.type) {
        throw new ValidationError(`El contenido del archivo no coincide con su extensión (${file.type}).`)
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

    // Increment trial counter after successful insert
    if (limitResult.plan === 'trial' || limitResult.plan === 'free') {
      await incrementTrialDocs(user.organization_id, limitResult.used)
    }

    await inngest.send({ name: 'docuai/document.uploaded', data: { documentId: document.id } })

    return NextResponse.json(
      { documentId: document.id, filename: document.filename, status: document.status },
      { status: 201 }
    )
  } catch (err) {
    return handleApiError(err)
  }
}
