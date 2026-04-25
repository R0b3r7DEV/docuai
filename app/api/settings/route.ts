import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError, ForbiddenError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'

export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const [orgResult, usageResult] = await Promise.all([
      supabaseServer
        .from('organizations')
        .select('id, name, slug, plan, org_type, gestoria_id, created_at, subscription_status, trial_docs_used, stripe_customer_id, stripe_subscription_id, current_period_end')
        .eq('id', user.organization_id)
        .single(),
      supabaseServer
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('status', 'done')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    if (orgResult.error || !orgResult.data) throw orgResult.error ?? new Error('Org not found')

    const plan = orgResult.data.plan as string
    const { TRIAL_DOC_LIMIT, PRO_DOC_LIMIT, GESTORIA_DOCS_PER_CLIENT } = await import('@/lib/stripe/constants')
    const isGestoriaClient = !!(orgResult.data.gestoria_id)
    const limit = isGestoriaClient
      ? GESTORIA_DOCS_PER_CLIENT
      : plan === 'trial' || plan === 'free' ? TRIAL_DOC_LIMIT
      : plan === 'pro' ? PRO_DOC_LIMIT : 50

    // Resolve gestoria name for client orgs
    let gestoria_name: string | null = null
    if (orgResult.data.gestoria_id) {
      const { data: gestoriaOrg } = await supabaseServer
        .from('organizations')
        .select('name')
        .eq('id', orgResult.data.gestoria_id)
        .single()
      gestoria_name = gestoriaOrg?.name ?? null
    }

    return NextResponse.json({
      org: { ...orgResult.data, gestoria_name },
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      usage: {
        used: plan === 'trial' || plan === 'free'
          ? (orgResult.data.trial_docs_used ?? 0)
          : (usageResult.count ?? 0),
        limit,
        plan,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

export async function PATCH(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenError()

    const body = await req.json()
    const { name } = UpdateOrgSchema.parse(body)

    const { data, error } = await supabaseServer
      .from('organizations')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', user.organization_id)
      .select('id, name, slug, plan')
      .single()

    if (error || !data) throw error ?? new Error('Error al actualizar la organización')

    return NextResponse.json({ org: data })
  } catch (err) {
    return handleApiError(err)
  }
}
