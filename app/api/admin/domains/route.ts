export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { domain, orgId } = await req.json() as { domain?: string; orgId?: string }
  if (!domain || !orgId) {
    return NextResponse.json({ error: 'domain and orgId required' }, { status: 400 })
  }

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return NextResponse.json({ error: 'Vercel credentials not configured' }, { status: 500 })
  }

  // Add domain to Vercel project
  const vercelRes = await fetch(
    `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    }
  )

  const vercelData = await vercelRes.json()
  if (!vercelRes.ok) {
    console.error('[admin/domains] Vercel error:', vercelData)
    return NextResponse.json({ error: 'Error adding domain to Vercel', details: vercelData }, { status: 502 })
  }

  // Update whitelabel config
  await supabaseServer
    .from('whitelabel_configs')
    .update({ custom_domain: domain })
    .eq('organization_id', orgId)

  return NextResponse.json({ success: true, domain, vercel: vercelData })
}
