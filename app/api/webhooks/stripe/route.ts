export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'

async function getOrgIdFromSubscription(subscriptionId: string): Promise<string | null> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return (subscription.metadata?.organization_id as string) ?? null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`[Stripe webhook] ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.organization_id
        const subscriptionId = session.subscription as string | null

        if (!orgId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const rawSub = subscription as unknown as { current_period_end?: number }
        const periodEnd = rawSub.current_period_end
          ? new Date(rawSub.current_period_end * 1000).toISOString()
          : null

        await supabaseServer
          .from('organizations')
          .update({
            plan: 'pro',
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            current_period_end: periodEnd,
          })
          .eq('id', orgId)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as { subscription?: string }).subscription
        if (!subscriptionId) break

        const orgId = await getOrgIdFromSubscription(subscriptionId)
        if (!orgId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const rawSub2 = subscription as unknown as { current_period_end?: number }
        const periodEnd2 = rawSub2.current_period_end
          ? new Date(rawSub2.current_period_end * 1000).toISOString()
          : null

        await supabaseServer
          .from('organizations')
          .update({
            subscription_status: 'active',
            current_period_end: periodEnd2,
          })
          .eq('id', orgId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as { subscription?: string }).subscription
        if (!subscriptionId) break

        const orgId = await getOrgIdFromSubscription(subscriptionId)
        if (!orgId) break

        await supabaseServer
          .from('organizations')
          .update({ subscription_status: 'past_due' })
          .eq('id', orgId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.organization_id
        if (!orgId) break

        await supabaseServer
          .from('organizations')
          .update({
            plan: 'trial',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            current_period_end: null,
            trial_docs_used: 0,
          })
          .eq('id', orgId)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[Stripe webhook] Error handling ${event.type}:`, err)
    // Return 200 so Stripe doesn't retry — log the error for investigation
  }

  return NextResponse.json({ received: true })
}
