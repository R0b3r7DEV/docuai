export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ForbiddenError, NotFoundError } from '@/lib/utils/errors'

type Params = { params: Promise<{ clientOrgId: string }> }

async function verifyGestoriaAccess(userId: string, gestoriaOrgId: string, clientOrgId: string) {
  const { data: link } = await supabaseServer
    .from('gestoria_clients')
    .select('id, status')
    .eq('gestoria_id', gestoriaOrgId)
    .eq('client_org_id', clientOrgId)
    .single()
  if (!link) throw new NotFoundError('Cliente')
  return link
}

/** GET /api/gestoria/clients/[clientOrgId] — client detail + full stats */
export async function GET(_req: NextRequest, { params }: Params) {
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

    await verifyGestoriaAccess(user.id, user.organization_id, clientOrgId)

    const { data: clientOrg } = await supabaseServer
      .from('organizations')
      .select('id, name, slug, plan, subscription_status, created_at, org_type')
      .eq('id', clientOrgId)
      .single()
    if (!clientOrg) throw new NotFoundError('Cliente')

    // Monthly stats
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: docs } = await supabaseServer
      .from('documents')
      .select('id, created_at, status, extraction:document_extractions(type)')
      .eq('organization_id', clientOrgId)
      .order('created_at', { ascending: false })

    const allDocs = docs ?? []
    const docsThisMonth = allDocs.filter(d => d.created_at >= startOfMonth && d.status === 'done').length
    const totalDocs = allDocs.filter(d => d.status === 'done').length
    const lastDocDate = allDocs.length > 0 ? allDocs[0].created_at : null

    // Type breakdown
    const typeCounts: Record<string, number> = {}
    for (const doc of allDocs) {
      const ext = Array.isArray(doc.extraction) ? doc.extraction[0] : doc.extraction
      if (ext?.type) typeCounts[ext.type] = (typeCounts[ext.type] ?? 0) + 1
    }

    return NextResponse.json({
      organization: clientOrg,
      stats: {
        docs_this_month: docsThisMonth,
        docs_total: totalDocs,
        last_doc_date: lastDocDate,
        type_breakdown: typeCounts,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

/** DELETE /api/gestoria/clients/[clientOrgId] — unlink client (no data deletion) */
export async function DELETE(_req: NextRequest, { params }: Params) {
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

    await verifyGestoriaAccess(user.id, user.organization_id, clientOrgId)

    const { error } = await supabaseServer
      .from('gestoria_clients')
      .delete()
      .eq('gestoria_id', user.organization_id)
      .eq('client_org_id', clientOrgId)

    if (error) throw error

    // Remove gestoria_id from the client org so it becomes independent
    await supabaseServer
      .from('organizations')
      .update({ gestoria_id: null })
      .eq('id', clientOrgId)

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
