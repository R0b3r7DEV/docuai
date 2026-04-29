import { supabaseServer } from '@/lib/supabase/server'
import type { WhitelabelConfig } from '@/types/database'

const BRAND_HOSTS = new Set([
  'lexia.es',
  'lexia.app',
  'docuai-one.vercel.app',
  'localhost',
  '127.0.0.1',
])

// Simple 60-second in-memory cache
const cache = new Map<string, { config: WhitelabelConfig | null; expiresAt: number }>()
const TTL_MS = 60_000

function stripPort(hostname: string): string {
  return hostname.split(':')[0]
}

export async function resolveWhitelabelConfig(
  hostname: string
): Promise<WhitelabelConfig | null> {
  const host = stripPort(hostname)

  if (BRAND_HOSTS.has(host) || host.endsWith('.vercel.app')) return null

  const cached = cache.get(host)
  if (cached && cached.expiresAt > Date.now()) return cached.config

  const { data } = await supabaseServer
    .from('whitelabel_configs')
    .select('*')
    .eq('custom_domain', host)
    .maybeSingle()

  const config = data as WhitelabelConfig | null
  cache.set(host, { config, expiresAt: Date.now() + TTL_MS })
  return config
}

export async function getWhitelabelFromOrg(
  orgId: string
): Promise<WhitelabelConfig | null> {
  const { data } = await supabaseServer
    .from('whitelabel_configs')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle()

  return data as WhitelabelConfig | null
}

export function isWhitelabelPlan(plan: string): boolean {
  return plan === 'whitelabel' || plan === 'whitelabel_pro'
}
