import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'
const FROM_EMAIL = 'DocuAI <noreply@docuai-one.vercel.app>'

export async function sendInvitationEmail(
  to: string,
  gestoriaName: string,
  companyName: string,
  token: string
): Promise<void> {
  const acceptUrl = `${APP_URL}/invite/${token}`

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#4f46e5;padding:32px 40px;text-align:center">
            <div style="display:inline-flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;text-align:center;line-height:32px">
                <span style="color:#fff;font-size:16px">📄</span>
              </div>
              <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">DocuAI</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.5px">
              ${gestoriaName} te invita a DocuAI
            </h1>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
              Tu gestoría <strong style="color:#0f172a">${gestoriaName}</strong> ha creado un espacio en DocuAI
              para <strong style="color:#0f172a">${companyName}</strong>.
            </p>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
              DocuAI extrae automáticamente los datos de tus facturas, contratos y nóminas —
              y responde cualquier pregunta sobre tus documentos usando inteligencia artificial.
            </p>
            <p style="margin:0 0 32px;color:#64748b;font-size:15px;line-height:1.6">
              Tu gestoría gestiona la suscripción. <strong style="color:#0f172a">Tú no pagas nada.</strong>
            </p>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#4f46e5">
                  <a href="${acceptUrl}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.2px">
                    Aceptar invitación →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:13px">
              Este enlace caduca en 7 días. Si no esperabas esta invitación, ignora este mensaje.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
              © ${new Date().getFullYear()} DocuAI — Impulsado por Claude AI
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${gestoriaName} te invita a DocuAI`,
    html,
  })
}
