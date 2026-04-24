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

    // Get or create Stripe customer for this organization
    const { data: org, error: orgError } = await supabaseServer
      .from('organizations')
      .select('id, name, stripe_customer_id, plan, subscription_status')
      .eq('id', user.organization_id)
      .single()

    if (orgError || !org) throw new Error('Organización no encontrada')

    // If already active pro, return portal URL instead
    if (org.plan === 'pro' && org.subscription_status === 'active') {
      return NextResponse.json({ error: 'Ya tienes un plan Pro activo' }, { status: 400 })
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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app/documents?upgraded=true`,
      cancel_url: `${baseUrl}/app/upgrade`,
      metadata: { organization_id: user.organization_id },
      subscription_data: {
        metadata: { organization_id: user.organization_id },
        trial_period_days: undefined,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return handleApiError(err)
  }
}
