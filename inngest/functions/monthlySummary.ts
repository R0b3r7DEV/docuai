import { inngest } from '../client'
import { supabaseServer } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/sender'
import { buildMonthlySummaryEmail } from '@/lib/email/templates'

function monthName(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export const monthlySummary = inngest.createFunction(
  { id: 'monthly-summary', retries: 2, triggers: [{ cron: '0 9 1 * *' }] },
  async ({ step }) => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

    const lastMonthStart = lastMonth.toISOString()
    const thisMonthStart = thisMonth.toISOString()
    const twoMonthsAgoStart = twoMonthsAgo.toISOString()
    const label = monthName(lastMonth)

    // Get all pro/gestoria orgs
    const orgs = await step.run('fetch-orgs', async () => {
      const { data } = await supabaseServer
        .from('organizations')
        .select('id, name, plan, org_type')
        .in('plan', ['pro', 'gestoria', 'gestoria_pro'])
        .eq('subscription_status', 'active')
      return data ?? []
    })

    // Process each org
    for (const org of orgs) {
      await step.run(`summary-${org.id}`, async () => {
        // Get owner email
        const { data: owner } = await supabaseServer
          .from('users')
          .select('email')
          .eq('organization_id', org.id)
          .eq('role', 'owner')
          .single()
        if (!owner?.email) return

        // Determine which org IDs to aggregate (gestoria → all clients too)
        let orgIds = [org.id]
        if (org.org_type === 'gestoria') {
          const { data: links } = await supabaseServer
            .from('gestoria_clients')
            .select('client_org_id')
            .eq('gestoria_id', org.id)
          const clientIds = (links ?? []).map(l => l.client_org_id)
          orgIds = [...orgIds, ...clientIds]
        }

        // Last month docs
        const { data: lastMonthDocs } = await supabaseServer
          .from('documents')
          .select('id')
          .in('organization_id', orgIds)
          .eq('status', 'done')
          .gte('created_at', lastMonthStart)
          .lt('created_at', thisMonthStart)
        const docsProcessed = lastMonthDocs?.length ?? 0

        // Month before for delta
        const { data: prevMonthDocs } = await supabaseServer
          .from('documents')
          .select('id')
          .in('organization_id', orgIds)
          .eq('status', 'done')
          .gte('created_at', twoMonthsAgoStart)
          .lt('created_at', lastMonthStart)
        const docsLastMonth = prevMonthDocs?.length ?? 0

        // Total amount and top vendors
        const { data: extractions } = await supabaseServer
          .from('document_extractions')
          .select('vendor, amount, currency, document:documents!inner(organization_id, created_at, status)')
          .in('document.organization_id', orgIds)
          .eq('document.status', 'done')
          .gte('document.created_at', lastMonthStart)
          .lt('document.created_at', thisMonthStart)

        let totalAmount = 0
        const vendorCounts: Record<string, number> = {}
        for (const ext of extractions ?? []) {
          if (ext.amount) totalAmount += ext.amount
          if (ext.vendor) vendorCounts[ext.vendor] = (vendorCounts[ext.vendor] ?? 0) + 1
        }

        const topVendors = Object.entries(vendorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([vendor, count]) => ({ vendor, count }))

        const { subject, html } = buildMonthlySummaryEmail({
          monthName: label,
          docsProcessed,
          docsLastMonth,
          totalAmount: totalAmount > 0 ? totalAmount : null,
          topVendors,
          orgName: org.name,
        })

        await sendEmail({ to: owner.email, subject, html })
      })
    }

    return { processed: orgs.length, month: label }
  }
)
