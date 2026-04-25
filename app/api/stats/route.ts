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
    const orgId = user.organization_id

    // Resolve org IDs to aggregate (gestoria → include all client orgs)
    const { data: org } = await supabaseServer
      .from('organizations')
      .select('org_type, plan, name, current_period_end, trial_docs_used')
      .eq('id', orgId)
      .single()

    let orgIds = [orgId]
    if (org?.org_type === 'gestoria') {
      const { data: links } = await supabaseServer
        .from('gestoria_clients')
        .select('client_org_id')
        .eq('gestoria_id', orgId)
      orgIds = [orgId, ...(links ?? []).map(l => l.client_org_id)]
    }

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

    // Total docs processed (all time)
    const { count: totalDocs } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('organization_id', orgIds)
      .eq('status', 'done')

    // Docs this month
    const { count: docsThisMonth } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('organization_id', orgIds)
      .eq('status', 'done')
      .gte('created_at', thisMonthStart)

    // Docs last month
    const { count: docsLastMonth } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('organization_id', orgIds)
      .eq('status', 'done')
      .gte('created_at', lastMonthStart)
      .lt('created_at', thisMonthStart)

    // All extractions this month for totals and vendor breakdown
    const { data: extractions } = await supabaseServer
      .from('document_extractions')
      .select('vendor, amount, currency, type, document:documents!inner(organization_id, created_at, status)')
      .in('document.organization_id', orgIds)
      .eq('document.status', 'done')
      .gte('document.created_at', thisMonthStart)

    let totalAmountThisMonth = 0
    const vendorCounts: Record<string, { count: number; amount: number }> = {}
    const typeCounts: Record<string, number> = {}

    for (const ext of extractions ?? []) {
      if (ext.amount) totalAmountThisMonth += ext.amount
      if (ext.vendor) {
        vendorCounts[ext.vendor] = vendorCounts[ext.vendor] ?? { count: 0, amount: 0 }
        vendorCounts[ext.vendor].count++
        if (ext.amount) vendorCounts[ext.vendor].amount += ext.amount
      }
      if (ext.type) {
        typeCounts[ext.type] = (typeCounts[ext.type] ?? 0) + 1
      }
    }

    const topVendors = Object.entries(vendorCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([vendor, data]) => ({ vendor, count: data.count, amount: data.amount }))

    const docsByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }))

    // Monthly spending trend — last 6 months
    const monthlyTrend: { month: string; docs: number; amount: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = start.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })

      const { data: monthExtractions } = await supabaseServer
        .from('document_extractions')
        .select('amount, document:documents!inner(organization_id, created_at, status)')
        .in('document.organization_id', orgIds)
        .eq('document.status', 'done')
        .gte('document.created_at', start.toISOString())
        .lt('document.created_at', end.toISOString())

      const { count: monthDocs } = await supabaseServer
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .in('organization_id', orgIds)
        .eq('status', 'done')
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())

      const monthAmount = (monthExtractions ?? []).reduce((sum, e) => sum + (e.amount ?? 0), 0)
      monthlyTrend.push({ month: label, docs: monthDocs ?? 0, amount: monthAmount })
    }

    const monthDelta = docsLastMonth
      ? Math.round(((( docsThisMonth ?? 0) - docsLastMonth) / docsLastMonth) * 100)
      : null

    return NextResponse.json({
      totalDocs: totalDocs ?? 0,
      docsThisMonth: docsThisMonth ?? 0,
      docsLastMonth: docsLastMonth ?? 0,
      monthDelta,
      totalAmountThisMonth: totalAmountThisMonth > 0 ? totalAmountThisMonth : null,
      topVendors,
      docsByType,
      monthlyTrend,
      plan: org?.plan ?? 'trial',
      orgName: org?.name ?? '',
    })
  } catch (err) {
    return handleApiError(err)
  }
}
