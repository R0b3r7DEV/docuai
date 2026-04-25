import { supabaseServer } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export const IMPERSONATION_HEADER = 'x-impersonate-org'

/** Generate and store a 1-hour impersonation token for a gestoría viewing a client org */
export async function createImpersonationToken(
  gestoriaId: string,
  clientOrgId: string,
  createdBy: string
): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const { error } = await supabaseServer.from('session_tokens').insert({
    token,
    gestoria_id: gestoriaId,
    client_org_id: clientOrgId,
    created_by: createdBy,
    expires_at: expiresAt,
  })

  if (error) throw new Error('Failed to create impersonation token')
  return token
}

/** Validate an impersonation token and return the client org ID if valid */
export async function validateImpersonationToken(token: string): Promise<{ gestoriaId: string; clientOrgId: string } | null> {
  const { data } = await supabaseServer
    .from('session_tokens')
    .select('gestoria_id, client_org_id, expires_at')
    .eq('token', token)
    .single()

  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null
  return { gestoriaId: data.gestoria_id, clientOrgId: data.client_org_id }
}

/** Get the org ID to use for a request — returns client org if impersonating, else own org */
export function getEffectiveOrgId(ownOrgId: string, impersonatedOrgId: string | null): string {
  return impersonatedOrgId ?? ownOrgId
}
