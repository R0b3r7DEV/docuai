import { createClient } from '@supabase/supabase-js'

// Cliente para uso en el browser — usa anon key, protegido por RLS
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
