export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError } from '@/lib/utils/errors'

export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org } = await supabaseServer
      .from('organizations')
      .select('plan, client_count')
      .eq('id', user.organization_id)
      .single()

    if (!org || !['whitelabel', 'whitelabel_pro'].includes(org.plan)) {
      return NextResponse.json({ error: 'Plan white-label requerido' }, { status: 403 })
    }

    const { data: clients } = await supabaseServer
      .from('gestoria_clients')
      .select('client_org_id, status, created_at, organizations!gestoria_clients_client_org_id_fkey(id, name, slug, plan, trial_docs_used)')
      .eq('gestoria_id', user.organization_id)
      .order('created_at', { ascending: false })

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const enriched = await Promise.all(
      (clients ?? []).map(async (c) => {
        const clientOrgId = c.client_org_id
        const { count: docsThisMonth } = await supabaseServer
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', clientOrgId)
          .eq('status', 'done')
          .gte('created_at', monthStart)

        return {
          ...c,
          docs_this_month: docsThisMonth ?? 0,
        }
      })
    )

    return NextResponse.json({
      clients: enriched,
      total: enriched.length,
      plan: org.plan,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
