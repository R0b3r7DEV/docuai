export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ForbiddenError, ValidationError } from '@/lib/utils/errors'
import { sendInvitationEmail } from '@/lib/email/invitations'
import { checkClientLimit } from '@/lib/stripe/limits'

/** GET /api/gestoria/invitations — list all invitations */
export async function GET() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: gestoria } = await supabaseServer
      .from('organizations')
      .select('id, org_type')
      .eq('id', user.organization_id)
      .single()
    if (!gestoria || gestoria.org_type !== 'gestoria') throw new ForbiddenError()

    const { data: invitations, error } = await supabaseServer
      .from('client_invitations')
      .select('*')
      .eq('gestoria_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Mark expired ones
    const now = new Date()
    const updated = (invitations ?? []).map(inv => ({
      ...inv,
      status: inv.status === 'pending' && new Date(inv.expires_at) < now ? 'expired' : inv.status,
    }))

    return NextResponse.json({ invitations: updated })
  } catch (err) {
    return handleApiError(err)
  }
}

const CreateInvitationSchema = z.object({
  email: z.string().email(),
  company_name: z.string().min(1).max(100).trim(),
})

/** POST /api/gestoria/invitations — create and send invitation */
export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: gestoria } = await supabaseServer
      .from('organizations')
      .select('id, name, org_type, plan, subscription_status')
      .eq('id', user.organization_id)
      .single()
    if (!gestoria || gestoria.org_type !== 'gestoria') throw new ForbiddenError()

    const limitCheck = await checkClientLimit(user.organization_id)
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.reason ?? 'Límite de clientes alcanzado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = CreateInvitationSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Validation error")
    const { email, company_name } = parsed.data

    // Create invitation record
    const { data: invitation, error } = await supabaseServer
      .from('client_invitations')
      .insert({
        gestoria_id: user.organization_id,
        email,
        company_name,
        status: 'pending',
      })
      .select()
      .single()

    if (error || !invitation) throw error ?? new Error('Error al crear la invitación')

    // Send email
    try {
      await sendInvitationEmail(email, gestoria.name, company_name, invitation.token)
    } catch (emailErr) {
      console.error('[Invitations] Email send failed:', emailErr)
      // Don't fail the request — invitation record exists, email can be resent
    }

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
