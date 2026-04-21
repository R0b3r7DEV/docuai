import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { generateXlsx } from '@/lib/utils/export'
import { ExportParamsSchema } from '@/lib/utils/validators'
import { handleApiError, RateLimitError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import type { DocumentWithExtraction } from '@/types/database'

const EXPORT_RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    // Rate limit: max 10 exports per hour per org
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await supabaseServer
      .from('export_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .gte('created_at', windowStart)

    if ((count ?? 0) >= EXPORT_RATE_LIMIT) {
      throw new RateLimitError('Límite de exportaciones alcanzado (10 por hora). Inténtalo más tarde.')
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries())
    const filters = ExportParamsSchema.parse(params)

    // Fetch all done documents with extractions, then filter in JS
    // (PostgREST filtering on nested relations requires !inner join which excludes null extractions)
    const { data, error } = await supabaseServer
      .from('documents')
      .select('*, extraction:document_extractions(*)')
      .eq('organization_id', user.organization_id)
      .eq('status', 'done')
      .order('created_at', { ascending: false })

    if (error) throw error

    let docs = (data ?? []) as DocumentWithExtraction[]

    if (filters.type) {
      docs = docs.filter((d) => d.extraction?.type === filters.type)
    }
    if (filters.category) {
      docs = docs.filter((d) => d.extraction?.category === filters.category)
    }
    if (filters.dateFrom) {
      docs = docs.filter((d) => d.extraction?.issue_date && d.extraction.issue_date >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      docs = docs.filter((d) => d.extraction?.issue_date && d.extraction.issue_date <= filters.dateTo!)
    }

    const xlsx = generateXlsx(docs)

    // Log the export after generating (don't block on errors)
    supabaseServer
      .from('export_logs')
      .insert({ organization_id: user.organization_id, user_id: user.id })
      .then(undefined, (e) => console.error('[export] error logging export:', e))

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `docuai_export_${date}.xlsx`

    return new NextResponse(new Uint8Array(xlsx), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
