import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { DocumentFiltersSchema } from '@/lib/utils/validators'
import { handleApiError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'

export async function GET(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const params = Object.fromEntries(req.nextUrl.searchParams.entries())
    const filters = DocumentFiltersSchema.parse(params)

    let query = supabaseServer
      .from('documents')
      .select('*, extraction:document_extractions(*)', { count: 'exact' })
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })
      .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1)

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.ilike('filename', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page: filters.page,
      limit: filters.limit,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
