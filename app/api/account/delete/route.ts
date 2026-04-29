import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError } from '@/lib/utils/errors'

export async function DELETE() {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    // Delete chat history
    await supabaseServer
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)

    // Delete documents uploaded by this user (extractions cascade via FK)
    await supabaseServer
      .from('documents')
      .delete()
      .eq('uploaded_by', user.id)

    // If user is owner and sole member, delete the organization
    const { count: memberCount } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)

    if (user.role === 'owner' && (memberCount ?? 0) <= 1) {
      await supabaseServer
        .from('organizations')
        .delete()
        .eq('id', user.organization_id)
    }

    // Delete user row from Supabase (must be last — auth checks use it)
    await supabaseServer
      .from('users')
      .delete()
      .eq('id', user.id)

    // Delete from Clerk (invalidates all sessions)
    const clerk = await clerkClient()
    await clerk.users.deleteUser(user.id)

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
