export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ForbiddenError, ValidationError } from '@/lib/utils/errors'
import { checkClientLimit } from '@/lib/stripe/limits'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

/** GET /api/gestoria/clients — list all clients with monthly stats */
export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org } = await supabaseServer
      .from('organizations')
      .select('id, org_type, plan, subscription_status')
      .eq('id', user.organization_id)
      .single()

    if (!org || org.org_type !== 'gestoria') throw new ForbiddenError()

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const { data: clients, error } = await supabaseServer
      .from('gestoria_clients')
      .select(`
        id, gestoria_id, client_org_id, status, created_at,
        organization:organizations!gestoria_clients_client_org_id_fkey(
          id, name, slug, plan, subscription_status, org_type, created_at
        )
      `)
      .eq('gestoria_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get monthly doc counts for all clients
    const clientOrgIds = (clients ?? []).map(c => c.client_org_id)
    let docCounts: Record<string, number> = {}
    let lastDocDates: Record<string, string | null> = {}

    if (clientOrgIds.length > 0) {
      const { data: docs } = await supabaseServer
        .from('documents')
        .select('organization_id, created_at')
        .in('organization_id', clientOrgIds)
        .eq('status', 'done')

      for (const doc of docs ?? []) {
        const docDate = doc.created_at as string
        if (!lastDocDates[doc.organization_id] || docDate > lastDocDates[doc.organization_id]!) {
          lastDocDates[doc.organization_id] = docDate
        }
        if (docDate >= startOfMonth) {
          docCounts[doc.organization_id] = (docCounts[doc.organization_id] ?? 0) + 1
        }
      }
    }

    const result = (clients ?? []).map(c => ({
      id: c.id,
      gestoria_id: c.gestoria_id,
      client_org_id: c.client_org_id,
      status: c.status,
      created_at: c.created_at,
      organization: c.organization,
      docs_this_month: docCounts[c.client_org_id] ?? 0,
      last_doc_date: lastDocDates[c.client_org_id] ?? null,
    }))

    return NextResponse.json({ clients: result })
  } catch (err) {
    return handleApiError(err)
  }
}

const CreateClientSchema = z.object({
  company_name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
})

/** POST /api/gestoria/clients — create a new client organization */
export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org } = await supabaseServer
      .from('organizations')
      .select('id, org_type, plan, subscription_status')
      .eq('id', user.organization_id)
      .single()

    if (!org || org.org_type !== 'gestoria') throw new ForbiddenError()

    const limitCheck = await checkClientLimit(user.organization_id)
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.reason ?? 'Límite de clientes alcanzado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = CreateClientSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Validation error")
    const { company_name, slug: rawSlug } = parsed.data

    const slug = rawSlug ?? slugify(company_name)

    // Check slug uniqueness
    const { data: existing } = await supabaseServer
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

    // Create the client organization
    const { data: newOrg, error: orgError } = await supabaseServer
      .from('organizations')
      .insert({
        name: company_name,
        slug: finalSlug,
        plan: 'pro',
        org_type: 'empresa',
        gestoria_id: user.organization_id,
        subscription_status: 'active',
        trial_docs_used: 0,
        client_count: 0,
        max_clients: 0,
      })
      .select()
      .single()

    if (orgError || !newOrg) throw orgError ?? new Error('Error al crear la organización cliente')

    // Link in gestoria_clients
    const { error: linkError } = await supabaseServer
      .from('gestoria_clients')
      .insert({
        gestoria_id: user.organization_id,
        client_org_id: newOrg.id,
        invited_by: user.id,
        status: 'active',
      })

    if (linkError) throw linkError

    return NextResponse.json({ client: newOrg }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
