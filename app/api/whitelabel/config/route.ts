export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod/v4'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ValidationError } from '@/lib/utils/errors'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/
const DOMAIN_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
const BLOCKED_DOMAINS = ['lexia', 'docuai', 'vercel', 'clerk', 'supabase', 'anthropic', 'stripe']

const ConfigSchema = z.object({
  brand_name: z.string().min(1).max(80),
  primary_color: z.string().regex(HEX_COLOR_RE, 'Color debe ser hexadecimal (#rrggbb)'),
  primary_dark: z.string().regex(HEX_COLOR_RE, 'Color debe ser hexadecimal (#rrggbb)').optional(),
  custom_domain: z.string().regex(DOMAIN_RE, 'Dominio inválido').optional().nullable(),
  support_email: z.string().email('Email inválido').optional().nullable(),
  hide_brand: z.boolean().optional(),
  custom_login_message: z.string().max(200).optional().nullable(),
  custom_footer_text: z.string().max(100).optional().nullable(),
})

export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data } = await supabaseServer
      .from('whitelabel_configs')
      .select('*')
      .eq('organization_id', user.organization_id)
      .maybeSingle()

    return NextResponse.json({ config: data ?? null })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org } = await supabaseServer
      .from('organizations')
      .select('plan')
      .eq('id', user.organization_id)
      .single()

    if (!org || !['whitelabel', 'whitelabel_pro'].includes(org.plan)) {
      return NextResponse.json({ error: 'Plan white-label requerido' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = ConfigSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
    }

    const { data: d } = parsed

    // Block domains that could impersonate Lexia
    if (d.custom_domain) {
      const domainLower = d.custom_domain.toLowerCase()
      if (BLOCKED_DOMAINS.some(b => domainLower.includes(b))) {
        return NextResponse.json({ error: 'Dominio no permitido' }, { status: 400 })
      }
      // Custom domain only for whitelabel_pro
      if (org.plan !== 'whitelabel_pro') {
        return NextResponse.json({ error: 'El dominio personalizado requiere plan White-Label Pro' }, { status: 403 })
      }
    }

    const { data: existing } = await supabaseServer
      .from('whitelabel_configs')
      .select('id')
      .eq('organization_id', user.organization_id)
      .maybeSingle()

    if (existing) {
      await supabaseServer
        .from('whitelabel_configs')
        .update({ ...d, updated_at: new Date().toISOString() })
        .eq('organization_id', user.organization_id)
    } else {
      await supabaseServer
        .from('whitelabel_configs')
        .insert({ ...d, organization_id: user.organization_id })
    }

    const { data: saved } = await supabaseServer
      .from('whitelabel_configs')
      .select('*')
      .eq('organization_id', user.organization_id)
      .single()

    return NextResponse.json({ config: saved })
  } catch (err) {
    return handleApiError(err)
  }
}
