import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getSignedUrl } from '@/lib/supabase/storage'
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
      .select('storage_path, organization_id, filename')
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Documento')
    if (data.organization_id !== user.organization_id) throw new ForbiddenError()

    // 60-second signed URL
    const signedUrl = await getSignedUrl(data.storage_path, 60)

    return NextResponse.json({ signedUrl, filename: data.filename })
  } catch (err) {
    return handleApiError(err)
  }
}
