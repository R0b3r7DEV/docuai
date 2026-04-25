const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://docuai-one.vercel.app'

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  margin: 0; padding: 0;
`
const CARD_STYLE = `
  background: #ffffff; border-radius: 12px;
  border: 1px solid #e2e8f0; overflow: hidden;
  max-width: 560px; margin: 0 auto;
`
const HEADER_BG = '#4f46e5'
const BODY_PAD = 'padding: 40px'
const MUTED = '#64748b'
const DARK = '#0f172a'

function header(title: string): string {
  return `
    <div style="background:${HEADER_BG};padding:28px 40px;display:flex;align-items:center;gap:10px">
      <div style="width:30px;height:30px;background:rgba(255,255,255,.2);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:15px">📄</span>
      </div>
      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.3px">DocuAI</span>
    </div>
  `
}

function footer(orgName?: string): string {
  return `
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">
        © ${new Date().getFullYear()} DocuAI${orgName ? ` · ${orgName}` : ''} — Impulsado por Claude AI
      </p>
    </div>
  `
}

function ctaButton(label: string, href: string): string {
  return `
    <table cellpadding="0" cellspacing="0">
      <tr><td style="border-radius:8px;background:${HEADER_BG}">
        <a href="${href}" style="display:inline-block;padding:13px 26px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-.2px">
          ${label} →
        </a>
      </td></tr>
    </table>
  `
}

function wrap(body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <div style="${CARD_STYLE}">
        ${body}
      </div>
    </td></tr>
  </table>
</body></html>`
}

// ─── Welcome email ──────────────────────────────────────────────────────────
export function buildWelcomeEmail(fullName: string | null): { subject: string; html: string } {
  const greeting = fullName ? `Hola, ${fullName.split(' ')[0]}` : 'Hola'
  const html = wrap(`
    ${header('Bienvenido a DocuAI')}
    <div style="${BODY_PAD}">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${DARK}">
        ${greeting} — Bienvenido a DocuAI
      </h1>
      <p style="margin:0 0 24px;color:${MUTED};font-size:15px;line-height:1.6">
        Tu cuenta ya está lista. Tienes <strong style="color:${DARK}">2 documentos gratuitos</strong>
        para probar la extracción automática con IA.
      </p>
      <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:28px">
        <p style="margin:0 0 12px;font-weight:600;color:${DARK};font-size:14px">Cómo funciona en 3 pasos:</p>
        ${[
          ['1. Sube un documento', 'PDF, imagen o texto de cualquier factura, contrato o nómina.'],
          ['2. La IA extrae los datos', 'Tipo, proveedor, importe, fecha y categoría detectados automáticamente.'],
          ['3. Pregunta lo que quieras', 'Chat en lenguaje natural sobre todos tus documentos.'],
        ].map(([title, desc]) => `
          <div style="margin-bottom:10px;last-child:margin-bottom:0">
            <p style="margin:0 0 2px;font-weight:600;font-size:13px;color:${DARK}">${title}</p>
            <p style="margin:0;font-size:13px;color:${MUTED}">${desc}</p>
          </div>
        `).join('')}
      </div>
      ${ctaButton('Ir a mi panel', `${APP_URL}/app/documents`)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">
        Tienes 2 documentos gratis sin tarjeta de crédito. Actualiza a Pro (10 €/mes) cuando quieras más.
      </p>
    </div>
    ${footer()}
  `)
  return { subject: 'Bienvenido a DocuAI — Tu primer documento gratis', html }
}

// ─── Document processed email ───────────────────────────────────────────────
const TYPE_ES: Record<string, string> = {
  factura: 'Factura', presupuesto: 'Presupuesto', nomina: 'Nómina',
  contrato: 'Contrato', albaran: 'Albarán', extracto_bancario: 'Extracto bancario',
  balance: 'Balance', otro: 'Otro',
}
const CAT_ES: Record<string, string> = {
  suministros: 'Suministros', servicios: 'Servicios', personal: 'Personal',
  alquiler: 'Alquiler', material: 'Material', impuestos: 'Impuestos', otro: 'Otro',
}

export function buildDocumentProcessedEmail(opts: {
  filename: string
  documentId: string
  type: string
  vendor: string | null
  amount: number | null
  currency: string
  orgName: string
}): { subject: string; html: string } {
  const { filename, documentId, type, vendor, amount, currency, orgName } = opts
  const typeLabel = TYPE_ES[type] ?? type
  const amountStr = amount != null
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
    : null

  const rows = [
    ['Tipo', typeLabel],
    vendor ? ['Proveedor', vendor] : null,
    amountStr ? ['Importe', amountStr] : null,
  ].filter(Boolean) as [string, string][]

  const html = wrap(`
    ${header('Documento procesado')}
    <div style="${BODY_PAD}">
      <div style="width:42px;height:42px;border-radius:10px;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:20px">✓</span>
      </div>
      <h1 style="margin:0 0 6px;font-size:20px;font-weight:700;color:${DARK}">Documento procesado</h1>
      <p style="margin:0 0 24px;color:${MUTED};font-size:14px">${filename}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
        ${rows.map(([label, value]) => `
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 0;color:${MUTED};font-size:13px;width:40%">${label}</td>
            <td style="padding:10px 0;font-weight:600;color:${DARK};font-size:13px">${value}</td>
          </tr>
        `).join('')}
      </table>
      ${ctaButton('Ver documento', `${APP_URL}/app/documents/${documentId}`)}
    </div>
    ${footer(orgName)}
  `)
  return { subject: `✓ Documento procesado — ${filename}`, html }
}

// ─── Limit reached email ────────────────────────────────────────────────────
export function buildLimitReachedEmail(opts: {
  used: number
  limit: number
  plan: string
}): { subject: string; html: string } {
  const { used, limit, plan } = opts
  const isTrial = plan === 'trial' || plan === 'free'
  const html = wrap(`
    ${header('Límite alcanzado')}
    <div style="${BODY_PAD}">
      <div style="width:42px;height:42px;border-radius:10px;background:#fef3c7;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:20px">⚠️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${DARK}">Has llegado al límite de tu plan</h1>
      <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6">
        Has procesado <strong style="color:${DARK}">${used} de ${limit} documentos</strong>
        ${isTrial ? 'de tu plan de prueba gratuito' : 'de tu plan mensual'}.
        Para seguir procesando documentos, actualiza tu plan.
      </p>
      <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:28px">
        <p style="margin:0 0 10px;font-weight:600;font-size:13px;color:${DARK}">Plan Pro incluye:</p>
        ${['Hasta 20 documentos al mes', 'Chat IA ilimitado', 'Exportación a Excel', 'Soporte por email'].map(f =>
          `<p style="margin:0 0 6px;font-size:13px;color:${MUTED}">✓ ${f}</p>`
        ).join('')}
      </div>
      ${ctaButton('Actualizar plan — 10 €/mes', `${APP_URL}/app/upgrade`)}
    </div>
    ${footer()}
  `)
  return { subject: 'Has llegado al límite de tu plan en DocuAI', html }
}

// ─── Monthly summary email ──────────────────────────────────────────────────
export function buildMonthlySummaryEmail(opts: {
  monthName: string
  docsProcessed: number
  docsLastMonth: number
  totalAmount: number | null
  topVendors: Array<{ vendor: string; count: number }>
  orgName: string
}): { subject: string; html: string } {
  const { monthName, docsProcessed, docsLastMonth, totalAmount, topVendors, orgName } = opts
  const amountStr = totalAmount != null
    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalAmount)
    : null
  const delta = docsLastMonth > 0
    ? Math.round(((docsProcessed - docsLastMonth) / docsLastMonth) * 100)
    : null
  const deltaStr = delta != null ? (delta >= 0 ? `+${delta}%` : `${delta}%`) : null

  const html = wrap(`
    ${header(`Resumen de ${monthName}`)}
    <div style="${BODY_PAD}">
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${DARK}">Tu resumen de ${monthName}</h1>
      <p style="margin:0 0 24px;color:${MUTED};font-size:14px">${orgName}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px">
        ${[
          ['Documentos procesados', String(docsProcessed), deltaStr ? `${deltaStr} vs mes anterior` : ''],
          amountStr ? ['Gasto total detectado', amountStr, 'suma de importes'] : null,
        ].filter(Boolean).map(row => `
          <div style="background:#f8fafc;border-radius:8px;padding:16px">
            <p style="margin:0 0 4px;font-size:12px;color:${MUTED}">${(row as string[])[0]}</p>
            <p style="margin:0 0 2px;font-size:22px;font-weight:700;color:${DARK}">${(row as string[])[1]}</p>
            ${(row as string[])[2] ? `<p style="margin:0;font-size:11px;color:${MUTED}">${(row as string[])[2]}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ${topVendors.length > 0 ? `
        <div style="margin-bottom:28px">
          <p style="margin:0 0 12px;font-weight:600;font-size:14px;color:${DARK}">Top proveedores</p>
          <table style="width:100%;border-collapse:collapse">
            ${topVendors.slice(0, 3).map((v, i) => `
              <tr style="border-bottom:1px solid #f1f5f9">
                <td style="padding:8px 0;color:${MUTED};font-size:12px;width:20px">${i + 1}</td>
                <td style="padding:8px 0;font-size:13px;color:${DARK}">${v.vendor}</td>
                <td style="padding:8px 0;font-size:13px;color:${MUTED};text-align:right">${v.count} doc${v.count !== 1 ? 's' : ''}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
      ${ctaButton('Ver todos mis documentos', `${APP_URL}/app/documents`)}
    </div>
    ${footer(orgName)}
  `)
  return { subject: `Tu resumen de ${monthName} en DocuAI`, html }
}

// ─── Payment failed email ───────────────────────────────────────────────────
export function buildPaymentFailedEmail(): { subject: string; html: string } {
  const html = wrap(`
    ${header('Problema con tu pago')}
    <div style="${BODY_PAD}">
      <div style="width:42px;height:42px;border-radius:10px;background:#fee2e2;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
        <span style="font-size:20px">⚠️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${DARK}">Problema con tu pago</h1>
      <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6">
        No hemos podido procesar el pago de tu suscripción DocuAI.
        Para mantener el acceso, actualiza tu método de pago lo antes posible.
      </p>
      <p style="margin:0 0 28px;color:${MUTED};font-size:14px;line-height:1.6">
        Si el pago no se resuelve en los próximos días, tu cuenta pasará al plan de prueba
        y perderás acceso a los documentos procesados con el plan Pro.
      </p>
      ${ctaButton('Actualizar método de pago', `${APP_URL}/app/upgrade`)}
      <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">
        Si ya actualizaste tu pago, ignora este mensaje.
      </p>
    </div>
    ${footer()}
  `)
  return { subject: '⚠️ Problema con tu pago en DocuAI', html }
}
