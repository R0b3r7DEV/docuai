import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'

export async function GET(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const sp = req.nextUrl.searchParams
    const page     = Math.max(1, Number(sp.get('page')     ?? '1'))
    const pageSize = Math.min(100, Math.max(1, Number(sp.get('pageSize') ?? '50')))

    const from = (page - 1) * pageSize
    const to   = from + pageSize - 1

    const { data, error, count } = await supabaseServer
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      limit: pageSize,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
