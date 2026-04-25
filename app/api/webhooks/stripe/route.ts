export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import { GESTORIA_MAX_CLIENTS, GESTORIA_PRO_MAX_CLIENTS } from '@/lib/stripe/constants'

async function getOrgIdFromSubscription(subscriptionId: string): Promise<string | null> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return (subscription.metadata?.organization_id as string) ?? null
}

async function getPlanFromSubscription(subscriptionId: string): Promise<string> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return (subscription.metadata?.plan as string) ?? 'pro'
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
        const plan = (session.metadata?.plan ?? 'pro') as string

        if (!orgId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const rawSub = subscription as unknown as { current_period_end?: number }
        const periodEnd = rawSub.current_period_end
          ? new Date(rawSub.current_period_end * 1000).toISOString()
          : null

        // Determine gestoria settings based on plan
        const isGestoria = plan === 'gestoria' || plan === 'gestoria_pro'
        const maxClients = plan === 'gestoria'
          ? GESTORIA_MAX_CLIENTS
          : plan === 'gestoria_pro'
            ? GESTORIA_PRO_MAX_CLIENTS
            : 0

        const updateData: Record<string, unknown> = {
          plan,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          current_period_end: periodEnd,
        }

        if (isGestoria) {
          updateData.org_type = 'gestoria'
          updateData.max_clients = maxClients
        }

        await supabaseServer
          .from('organizations')
          .update(updateData)
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
        const rawSub = subscription as unknown as { current_period_end?: number }
        const periodEnd = rawSub.current_period_end
          ? new Date(rawSub.current_period_end * 1000).toISOString()
          : null

        await supabaseServer
          .from('organizations')
          .update({ subscription_status: 'active', current_period_end: periodEnd })
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

        const { data: org } = await supabaseServer
          .from('organizations')
          .select('org_type')
          .eq('id', orgId)
          .single()

        const wasGestoria = org?.org_type === 'gestoria'

        await supabaseServer
          .from('organizations')
          .update({
            plan: 'trial',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            current_period_end: null,
            trial_docs_used: 0,
            ...(wasGestoria ? { org_type: 'empresa', max_clients: 0 } : {}),
          })
          .eq('id', orgId)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[Stripe webhook] Error handling ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
