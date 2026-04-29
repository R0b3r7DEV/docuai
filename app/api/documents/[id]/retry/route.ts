import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { inngest } from '@/inngest/client'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError } from '@/lib/utils/errors'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()
    const { id: documentId } = await params

    const { data: doc, error } = await supabaseServer
      .from('documents')
      .select('id, status, organization_id')
      .eq('id', documentId)
      .eq('organization_id', user.organization_id)
      .single()

    if (error || !doc) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    if (doc.status !== 'error') {
      return NextResponse.json({ error: 'El documento no está en estado de error' }, { status: 400 })
    }

    await supabaseServer
      .from('documents')
      .update({ status: 'pending', error_message: null })
      .eq('id', documentId)

    await inngest.send({ name: 'lexia/document.uploaded', data: { documentId } })

    return NextResponse.json({ documentId, status: 'pending' })
  } catch (err) {
    return handleApiError(err)
  }
}
