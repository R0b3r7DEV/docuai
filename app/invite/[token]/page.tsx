import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { SignUp } from '@clerk/nextjs'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Props { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const { data: invitation } = await supabaseServer
    .from('client_invitations')
    .select('id, gestoria_id, email, company_name, status, expires_at, gestoria:organizations!client_invitations_gestoria_id_fkey(name)')
    .eq('token', token)
    .single()

  // Already accepted
  if (invitation?.status === 'accepted') {
    redirect('/sign-in')
  }

  const expired = !invitation || invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()
  const gestoriaRaw = invitation?.gestoria as unknown
  const gestoriaName = Array.isArray(gestoriaRaw)
    ? (gestoriaRaw[0] as { name: string })?.name ?? 'Tu gestoría'
    : (gestoriaRaw as { name: string } | null)?.name ?? 'Tu gestoría'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">Lexia</span>
      </div>

      {expired ? (
        <div className="max-w-sm w-full flex flex-col items-center gap-4 text-center rounded-2xl border bg-card p-8">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Invitación no válida</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {!invitation
                ? 'No encontramos esta invitación.'
                : 'Este enlace de invitación ha caducado o ya fue usado.'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Contacta con tu gestoría para que te envíe una nueva invitación.
          </p>
          <Link href="/sign-in" className="text-sm text-primary hover:underline">
            Ya tengo una cuenta — Iniciar sesión
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{gestoriaName} te invita a Lexia</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Crea tu cuenta para acceder al panel de <strong>{invitation.company_name}</strong>.
              Tu gestoría gestiona la suscripción — no pagas nada.
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border rounded-2xl',
              },
            }}
            initialValues={{ emailAddress: invitation.email }}
            forceRedirectUrl={`/invite/${token}/complete`}
            signInUrl="/sign-in"
          />
        </div>
      )}
    </div>
  )
}
