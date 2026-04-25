import { supabaseServer } from '@/lib/supabase/server'
import {
  TRIAL_DOC_LIMIT,
  PRO_DOC_LIMIT,
  GESTORIA_MAX_CLIENTS,
  GESTORIA_PRO_MAX_CLIENTS,
  GESTORIA_DOCS_PER_CLIENT,
} from './constants'
export {
  TRIAL_DOC_LIMIT,
  PRO_DOC_LIMIT,
  GESTORIA_MAX_CLIENTS,
  GESTORIA_PRO_MAX_CLIENTS,
  GESTORIA_DOCS_PER_CLIENT,
} from './constants'

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
    .select('plan, subscription_status, trial_docs_used, gestoria_id, org_type')
    .eq('id', orgId)
    .single()

  if (error || !org) {
    return { allowed: false, reason: 'Organización no encontrada', used: 0, limit: 0, plan: 'trial', subscriptionStatus: 'trialing' }
  }

  const plan: string = org.plan ?? 'trial'
  const subscriptionStatus: string = org.subscription_status ?? 'trialing'
  const trialUsed: number = org.trial_docs_used ?? 0

  // Client org managed by a gestoría — use gestoría limits
  if (org.gestoria_id) {
    const { data: gestoria } = await supabaseServer
      .from('organizations')
      .select('plan, subscription_status')
      .eq('id', org.gestoria_id)
      .single()

    if (!gestoria || gestoria.subscription_status !== 'active') {
      return { allowed: false, reason: 'La gestoría no tiene una suscripción activa.', used: 0, limit: 0, plan, subscriptionStatus }
    }

    // Check monthly docs for this client
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { count } = await supabaseServer
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'done')
      .gte('created_at', startOfMonth)

    const used = count ?? 0
    const allowed = used < GESTORIA_DOCS_PER_CLIENT
    return {
      allowed,
      reason: allowed ? undefined : `Este cliente ha alcanzado el límite mensual de ${GESTORIA_DOCS_PER_CLIENT} documentos.`,
      used,
      limit: GESTORIA_DOCS_PER_CLIENT,
      plan,
      subscriptionStatus,
    }
  }

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

  // Gestoría plans upload directly (rare) — same as pro per-org
  if (plan === 'gestoria' || plan === 'gestoria_pro') {
    if (subscriptionStatus !== 'active') {
      return { allowed: false, reason: 'Tu suscripción de gestoría no está activa.', used: 0, limit: PRO_DOC_LIMIT, plan, subscriptionStatus }
    }
    return { allowed: true, used: 0, limit: PRO_DOC_LIMIT, plan, subscriptionStatus }
  }

  return { allowed: false, reason: 'Plan no reconocido', used: 0, limit: 0, plan, subscriptionStatus }
}

/** Check if a gestoría can add more clients */
export async function checkClientLimit(gestoriaOrgId: string): Promise<{ allowed: boolean; reason?: string; used: number; limit: number }> {
  const { data: org } = await supabaseServer
    .from('organizations')
    .select('plan, subscription_status, client_count, max_clients')
    .eq('id', gestoriaOrgId)
    .single()

  if (!org) return { allowed: false, reason: 'Organización no encontrada', used: 0, limit: 0 }

  if (org.subscription_status !== 'active') {
    return { allowed: false, reason: 'La suscripción de gestoría no está activa.', used: org.client_count, limit: org.max_clients }
  }

  const maxClients = org.max_clients as number
  if (maxClients === -1) return { allowed: true, used: org.client_count, limit: -1 } // unlimited

  const allowed = org.client_count < maxClients
  return {
    allowed,
    reason: allowed ? undefined : `Has alcanzado el límite de ${maxClients} empresas clientes.`,
    used: org.client_count,
    limit: maxClients,
  }
}

/** Atomically increment trial_docs_used for an org. */
export async function incrementTrialDocs(orgId: string, currentUsed: number): Promise<void> {
  await supabaseServer
    .from('organizations')
    .update({ trial_docs_used: currentUsed + 1 })
    .eq('id', orgId)
}
