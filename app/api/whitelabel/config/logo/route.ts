export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/utils/auth'
import { handleApiError, ValidationError } from '@/lib/utils/errors'

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    await auth.protect()
    const user = await getAuthenticatedUser()

    const { data: org } = await supabaseServer
      .from('organizations')
      .select('plan')
      .eq('id', user.organization_id)
      .single()

    if (!org || !['whitelabel', 'whitelabel_pro'].includes(org.plan)) {
      return NextResponse.json({ error: 'Plan white-label requerido' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) ?? 'logo' // 'logo' | 'favicon'

    if (!file) throw new ValidationError('No se proporcionó ningún archivo')
    if (!ALLOWED_TYPES.includes(file.type)) throw new ValidationError(`Tipo no permitido: ${file.type}`)
    if (file.size > MAX_LOGO_BYTES) throw new ValidationError('El archivo supera el límite de 2 MB')

    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1]
    const path = `${user.organization_id}/${type}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseServer.storage
      .from('whitelabel')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`)

    const { data: { publicUrl } } = supabaseServer.storage
      .from('whitelabel')
      .getPublicUrl(path)

    const field = type === 'logo' ? 'brand_logo_url' : 'brand_favicon_url'

    const { data: existing } = await supabaseServer
      .from('whitelabel_configs')
      .select('id')
      .eq('organization_id', user.organization_id)
      .maybeSingle()

    if (existing) {
      await supabaseServer
        .from('whitelabel_configs')
        .update({ [field]: publicUrl })
        .eq('organization_id', user.organization_id)
    } else {
      await supabaseServer
        .from('whitelabel_configs')
        .insert({ organization_id: user.organization_id, brand_name: 'Mi Marca', [field]: publicUrl })
    }

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    return handleApiError(err)
  }
}
