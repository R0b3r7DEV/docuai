export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError, ValidationError } from '@/lib/utils/errors'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

const AcceptSchema = z.object({
  token: z.string().min(1),
  clerk_user_id: z.string().min(1),
})

/** POST /api/gestoria/invitations/accept — accept an invitation (called after Clerk signup) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = AcceptSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Validation error")
    const { token, clerk_user_id } = parsed.data

    // Validate token
    const { data: invitation } = await supabaseServer
      .from('client_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no válida o ya usada' }, { status: 400 })
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'La invitación ha caducado' }, { status: 400 })
    }

    // Check if user already has an org (re-accept case)
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id, organization_id')
      .eq('id', clerk_user_id)
      .single()

    let clientOrgId: string

    if (existingUser?.organization_id) {
      clientOrgId = existingUser.organization_id
    } else {
      // Create the client organization
      const slug = slugify(invitation.company_name)
      const { data: existing } = await supabaseServer
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()
      const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

      const { data: newOrg, error: orgError } = await supabaseServer
        .from('organizations')
        .insert({
          name: invitation.company_name,
          slug: finalSlug,
          plan: 'pro',
          org_type: 'empresa',
          gestoria_id: invitation.gestoria_id,
          subscription_status: 'active',
          trial_docs_used: 0,
          client_count: 0,
          max_clients: 0,
        })
        .select()
        .single()

      if (orgError || !newOrg) throw orgError ?? new Error('Error al crear la organización')
      clientOrgId = newOrg.id

      // Link in gestoria_clients
      const { data: gestoriaUser } = await supabaseServer
        .from('users')
        .select('id')
        .eq('organization_id', invitation.gestoria_id)
        .eq('role', 'owner')
        .single()

      await supabaseServer.from('gestoria_clients').insert({
        gestoria_id: invitation.gestoria_id,
        client_org_id: clientOrgId,
        invited_by: gestoriaUser?.id ?? clerk_user_id,
        status: 'active',
      })
    }

    // Update invitation status
    await supabaseServer
      .from('client_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    // If user exists in Supabase, update their org
    if (existingUser) {
      await supabaseServer
        .from('users')
        .update({ organization_id: clientOrgId })
        .eq('id', clerk_user_id)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'
    return NextResponse.json({
      success: true,
      organization_id: clientOrgId,
      redirect_url: `${baseUrl}/app/documents`,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
