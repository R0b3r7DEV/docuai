import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getSignedUrl, deleteFromStorage } from '@/lib/supabase/storage'
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors'
import { UuidSchema } from '@/lib/utils/validators'
import { getAuthenticatedUser } from '@/lib/utils/auth'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()
    const { id } = await params
    UuidSchema.parse(id)

    const { data, error } = await supabaseServer
      .from('documents')
      .select('*, extraction:document_extractions(*)')
      .eq('id', id)
      .eq('organization_id', user.organization_id)
      .single()

    if (error || !data) throw new NotFoundError('Documento')

    const signedUrl = await getSignedUrl(data.storage_path)
    return NextResponse.json({ document: data, signedUrl })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()
    const { id } = await params
    UuidSchema.parse(id)

    if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenError()

    const { data, error } = await supabaseServer
      .from('documents')
      .select('storage_path, organization_id')
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Documento')
    if (data.organization_id !== user.organization_id) throw new ForbiddenError()

    await deleteFromStorage(data.storage_path)
    await supabaseServer.from('documents').delete().eq('id', id)

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
