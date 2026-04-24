import { supabaseServer } from '@/lib/supabase/server'
import { TRIAL_DOC_LIMIT, PRO_DOC_LIMIT } from './constants'
export { TRIAL_DOC_LIMIT, PRO_DOC_LIMIT } from './constants'

export interface LimitResult {
  allowed: boolean
  reason?: string
  used: number
  limit: number
  plan: string
  subscriptionStatus: string
}

export async function checkDocumentLimit(orgId: string): Promise<LimitResult> {
  const { data: org, error } = await supabaseServer
    .from('organizations')
    .select('plan, subscription_status, trial_docs_used')
    .eq('id', orgId)
    .single()

  if (error || !org) {
    return { allowed: false, reason: 'Organización no encontrada', used: 0, limit: 0, plan: 'trial', subscriptionStatus: 'trialing' }
  }

  const plan: string = org.plan ?? 'trial'
  const subscriptionStatus: string = org.subscription_status ?? 'trialing'
  const trialUsed: number = org.trial_docs_used ?? 0

  // Trial (or legacy free) plan: check trial_docs_used counter
  if (plan === 'trial' || plan === 'free') {
    const limit = TRIAL_DOC_LIMIT
    const allowed = trialUsed < limit
    return {
      allowed,
      reason: allowed ? undefined : `Has usado tus ${limit} documentos de prueba. Suscríbete para continuar.`,
      used: trialUsed,
      limit,
      plan,
      subscriptionStatus,
    }
  }

  // Pro plan: check monthly usage
  if (plan === 'pro') {
    if (subscriptionStatus !== 'active') {
      return {
        allowed: false,
        reason: subscriptionStatus === 'past_due'
          ? 'Tu suscripción tiene un pago pendiente. Actualiza tu método de pago.'
          : 'Tu suscripción no está activa.',
        used: 0,
        limit: PRO_DOC_LIMIT,
        plan,
        subscriptionStatus,
      }
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { count } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'done')
      .gte('created_at', startOfMonth)

    const used = count ?? 0
    const allowed = used < PRO_DOC_LIMIT
    return {
      allowed,
      reason: allowed ? undefined : `Has alcanzado el límite mensual de ${PRO_DOC_LIMIT} documentos.`,
      used,
      limit: PRO_DOC_LIMIT,
      plan,
      subscriptionStatus,
    }
  }

  return { allowed: false, reason: 'Plan no reconocido', used: 0, limit: 0, plan, subscriptionStatus }
}

/** Atomically increment trial_docs_used for an org. */
export async function incrementTrialDocs(orgId: string, currentUsed: number): Promise<void> {
  await supabaseServer
    .from('organizations')
    .update({ trial_docs_used: currentUsed + 1 })
    .eq('id', orgId)
}
