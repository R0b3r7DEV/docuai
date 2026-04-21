import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import type { User } from '@/types/database'

export async function getAuthenticatedUser(): Promise<User> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('User not found in database')
  return data as User
}

export async function requireOrgMembership(organizationId: string): Promise<User> {
  const user = await getAuthenticatedUser()
  if (user.organization_id !== organizationId) throw new Error('Forbidden')
  return user
}
