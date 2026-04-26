export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { handleApiError, ValidationError } from '@/lib/utils/errors'

const BLOCKED_DOMAINS = ['docuai', 'vercel', 'clerk', 'supabase', 'anthropic', 'stripe']

export async function POST(req: NextRequest) {
  try {
    await auth.protect()

    const { domain } = await req.json() as { domain?: string }
    if (!domain) throw new ValidationError('Dominio requerido')

    const domainLower = domain.toLowerCase().trim()
    if (BLOCKED_DOMAINS.some(b => domainLower.includes(b))) {
      return NextResponse.json({ verified: false, error: 'Dominio no permitido' }, { status: 400 })
    }

    const instructions = [
      `1. Accede al panel de DNS de tu proveedor (GoDaddy, Namecheap, Cloudflare, etc.)`,
      `2. Crea un registro CNAME:`,
      `   Nombre: ${domain.split('.')[0]}`,
      `   Valor:  cname.vercel-dns.com`,
      `   TTL:    3600 (o Automático)`,
      `3. Espera la propagación del DNS (5-30 minutos)`,
      `4. Pulsa "Verificar" de nuevo`,
    ]

    // Try to verify by checking if domain resolves to Vercel
    let verified = false
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`https://${domainLower}`, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      })
      clearTimeout(timeoutId)

      const vercelId = res.headers.get('x-vercel-id') ?? res.headers.get('x-vercel-deployment-url')
      verified = !!vercelId
    } catch {
      verified = false
    }

    return NextResponse.json({ verified, instructions: verified ? [] : instructions })
  } catch (err) {
    return handleApiError(err)
  }
}
