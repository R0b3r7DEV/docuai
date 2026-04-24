export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'

export async function POST() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org, error: orgError } = await supabaseServer
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', user.organization_id)
      .single()

    if (orgError || !org?.stripe_customer_id) {
      return NextResponse.json({ error: 'No se encontró una suscripción activa' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${baseUrl}/app/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    return handleApiError(err)
  }
}
