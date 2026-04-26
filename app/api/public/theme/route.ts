export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const hostname = req.headers.get('x-hostname')
    ?? req.headers.get('host')
    ?? ''

  const host = hostname.split(':')[0]

  const { data } = await supabaseServer
    .from('whitelabel_configs')
    .select('brand_name, primary_color, primary_dark, brand_logo_url, brand_favicon_url')
    .eq('custom_domain', host)
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ isWhitelabel: false })
  }

  return NextResponse.json({
    isWhitelabel: true,
    brandName: data.brand_name,
    primaryColor: data.primary_color,
    primaryDark: data.primary_dark,
    logoUrl: data.brand_logo_url,
    faviconUrl: data.brand_favicon_url,
  })
}
