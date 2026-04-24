import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js'

let _stripe: Stripe | null = null

export function getStripeServer(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
  }
  return _stripe
}

// Keep named export for legacy imports — lazy so module eval doesn't throw at build time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeServer()[prop as keyof Stripe]
  },
})

// Browser-side Stripe client (singleton)
let stripePromise: Promise<StripeClient | null>

export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
