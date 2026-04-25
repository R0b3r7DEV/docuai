export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ForbiddenError } from '@/lib/utils/errors'

/** GET /api/gestoria/stats — global statistics across all clients */
export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: gestoria } = await supabaseServer
      .from('organizations')
      .select('id, org_type, name, plan, subscription_status, client_count, max_clients, current_period_end')
      .eq('id', user.organization_id)
      .single()
    if (!gestoria || gestoria.org_type !== 'gestoria') throw new ForbiddenError()

    // Get all client org IDs
    const { data: links } = await supabaseServer
      .from('gestoria_clients')
      .select('client_org_id')
      .eq('gestoria_id', user.organization_id)
      .eq('status', 'active')

    const clientOrgIds = (links ?? []).map(l => l.client_org_id)

    if (clientOrgIds.length === 0) {
      return NextResponse.json({
        total_clients: 0,
        active_clients_this_month: 0,
        docs_this_month: 0,
        top_clients: [],
        type_breakdown: {},
        weekly_evolution: [0, 0, 0, 0],
        gestoria: {
          name: gestoria.name,
          plan: gestoria.plan,
          subscription_status: gestoria.subscription_status,
          client_count: gestoria.client_count,
          max_clients: gestoria.max_clients,
          current_period_end: gestoria.current_period_end,
        },
      })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Fetch all documents for all clients
    const { data: docs } = await supabaseServer
      .from('documents')
      .select('id, organization_id, created_at, status, extraction:document_extractions(type)')
      .in('organization_id', clientOrgIds)
      .eq('status', 'done')
      .gte('created_at', startOfMonth)

    const allDocs = docs ?? []

    // Docs this month
    const docsThisMonth = allDocs.length

    // Active clients (have at least 1 doc this month)
    const activeClientIds = new Set(allDocs.map(d => d.organization_id))

    // Per-client doc counts
    const docsByClient: Record<string, number> = {}
    for (const doc of allDocs) {
      docsByClient[doc.organization_id] = (docsByClient[doc.organization_id] ?? 0) + 1
    }

    // Type breakdown
    const typeCounts: Record<string, number> = {}
    for (const doc of allDocs) {
      const ext = Array.isArray(doc.extraction) ? doc.extraction[0] : doc.extraction
      if (ext?.type) typeCounts[ext.type] = (typeCounts[ext.type] ?? 0) + 1
    }

    // Top 5 clients
    const { data: orgs } = await supabaseServer
      .from('organizations')
      .select('id, name, slug')
      .in('id', clientOrgIds)

    const orgMap: Record<string, { name: string; slug: string }> = {}
    for (const o of orgs ?? []) orgMap[o.id] = { name: o.name, slug: o.slug }

    const topClients = Object.entries(docsByClient)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([orgId, count]) => ({
        client_org_id: orgId,
        name: orgMap[orgId]?.name ?? orgId,
        slug: orgMap[orgId]?.slug ?? '',
        docs_this_month: count,
      }))

    // Weekly evolution (last 4 weeks)
    const weeklyEvolution = [0, 0, 0, 0]
    for (const doc of allDocs) {
      const docDate = new Date(doc.created_at)
      const daysAgo = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24))
      const weekIndex = Math.min(3, Math.floor(daysAgo / 7))
      weeklyEvolution[3 - weekIndex]++
    }

    return NextResponse.json({
      total_clients: clientOrgIds.length,
      active_clients_this_month: activeClientIds.size,
      docs_this_month: docsThisMonth,
      top_clients: topClients,
      type_breakdown: typeCounts,
      weekly_evolution: weeklyEvolution,
      gestoria: {
        name: gestoria.name,
        plan: gestoria.plan,
        subscription_status: gestoria.subscription_status,
        client_count: gestoria.client_count,
        max_clients: gestoria.max_clients,
        current_period_end: gestoria.current_period_end,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
