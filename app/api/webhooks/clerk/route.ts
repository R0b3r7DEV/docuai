import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabaseServer } from '@/lib/supabase/server'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserCreatedData {
  id: string
  email_addresses: ClerkEmailAddress[]
  first_name: string | null
  last_name: string | null
  primary_email_address_id: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserCreatedData
}

function slugFromEmail(email: string): string {
  const local = email.split('@')[0]
  return local
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function ensureUniqSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  let event: ClerkWebhookEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true })
  }

  const { id: clerkUserId, email_addresses, first_name, last_name, primary_email_address_id } = event.data

  const primaryEmail = email_addresses.find(e => e.id === primary_email_address_id)?.email_address
    ?? email_addresses[0]?.email_address

  if (!primaryEmail) {
    return NextResponse.json({ error: 'No email found' }, { status: 400 })
  }

  const fullName = [first_name, last_name].filter(Boolean).join(' ') || null
  const baseSlug = slugFromEmail(primaryEmail)

  const { data: existingOrg } = await supabaseServer
    .from('organizations')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle()

  const slug = existingOrg ? ensureUniqSlug(baseSlug) : baseSlug

  // New accounts start on 'trial' plan with 2 free documents
  const { data: org, error: orgError } = await supabaseServer
    .from('organizations')
    .insert({
      name: primaryEmail,
      slug,
      plan: 'trial',
      subscription_status: 'trialing',
      trial_docs_used: 0,
    })
    .select()
    .single()

  if (orgError || !org) {
    console.error('[Clerk webhook] Failed to create organization:', orgError)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }

  const { error: userError } = await supabaseServer
    .from('users')
    .insert({
      id: clerkUserId,
      email: primaryEmail,
      full_name: fullName,
      organization_id: org.id,
      role: 'owner',
    })

  if (userError) {
    console.error('[Clerk webhook] Failed to create user:', userError)
    await supabaseServer.from('organizations').delete().eq('id', org.id)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return NextResponse.json({ received: true, userId: clerkUserId, orgId: org.id })
}
