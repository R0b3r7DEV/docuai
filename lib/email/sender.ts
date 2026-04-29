import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const DEFAULT_FROM = 'Lexia <hola@lexia.es>'

interface SendOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send')
    return
  }
  try {
    const { data, error } = await resend.emails.send({
      from: opts.from ?? DEFAULT_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    if (error) {
      console.error('[email] send error', { to: opts.to, subject: opts.subject, error })
    } else {
      console.log('[email] sent', { id: data?.id, to: opts.to, subject: opts.subject })
    }
  } catch (err) {
    // Never throw — email failure must never break the main flow
    console.error('[email] unexpected error', { to: opts.to, subject: opts.subject, err })
  }
}
