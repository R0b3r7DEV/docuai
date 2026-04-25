export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/utils/errors'
import { getAuthenticatedUser } from '@/lib/utils/auth'

const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID,
  gestoria: process.env.STRIPE_GESTORIA_PRICE_ID,
  gestoria_pro: process.env.STRIPE_GESTORIA_PRO_PRICE_ID,
}

const PLAN_SUCCESS_URL: Record<string, string> = {
  pro: '/app/documents?upgraded=true',
  gestoria: '/onboarding/gestoria',
  gestoria_pro: '/onboarding/gestoria',
}

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    let plan = 'pro'
    try {
      const body = await req.json() as { plan?: string }
      if (body.plan && PLAN_PRICE_MAP[body.plan]) plan = body.plan
    } catch { /* no body */ }

    const priceId = PLAN_PRICE_MAP[plan]
    if (!priceId) {
      return NextResponse.json({ error: 'Plan no válido o no configurado' }, { status: 400 })
    }

    const { data: org, error: orgError } = await supabaseServer
      .from('organizations')
      .select('id, name, stripe_customer_id, plan, subscription_status')
      .eq('id', user.organization_id)
      .single()

    if (orgError || !org) throw new Error('Organización no encontrada')

    if (org.plan === plan && org.subscription_status === 'active') {
      return NextResponse.json({ error: 'Ya tienes este plan activo' }, { status: 400 })
    }

    let customerId: string = org.stripe_customer_id ?? ''

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: { organization_id: user.organization_id, user_id: user.id },
      })
      customerId = customer.id

      await supabaseServer
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.organization_id)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'
    const successPath = PLAN_SUCCESS_URL[plan] ?? '/app/documents?upgraded=true'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}/app/upgrade`,
      metadata: { organization_id: user.organization_id, plan },
      subscription_data: {
        metadata: { organization_id: user.organization_id, plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return handleApiError(err)
  }
}
