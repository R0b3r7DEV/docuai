export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ForbiddenError, NotFoundError } from '@/lib/utils/errors'
import { createImpersonationToken } from '@/lib/gestoria/impersonate'

type Params = { params: Promise<{ clientOrgId: string }> }

/** POST /api/gestoria/clients/[clientOrgId]/impersonate */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()
    const { clientOrgId } = await params

    const { data: gestoria } = await supabaseServer
      .from('organizations')
      .select('id, org_type')
      .eq('id', user.organization_id)
      .single()
    if (!gestoria || gestoria.org_type !== 'gestoria') throw new ForbiddenError()

    // Verify the client belongs to this gestoría
    const { data: link } = await supabaseServer
      .from('gestoria_clients')
      .select('id')
      .eq('gestoria_id', user.organization_id)
      .eq('client_org_id', clientOrgId)
      .single()
    if (!link) throw new NotFoundError('Cliente')

    const { data: clientOrg } = await supabaseServer
      .from('organizations')
      .select('id, name')
      .eq('id', clientOrgId)
      .single()
    if (!clientOrg) throw new NotFoundError('Cliente')

    const token = await createImpersonationToken(user.organization_id, clientOrgId, user.id)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'

    return NextResponse.json({
      token,
      client_name: clientOrg.name,
      redirect_url: `${baseUrl}/app/documents?impersonate=${token}`,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
