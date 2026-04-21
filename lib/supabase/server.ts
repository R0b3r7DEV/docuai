import { createClient } from '@supabase/supabase-js'

// Cliente para uso exclusivo en el servidor — usa service_role key (bypass RLS)
// NUNCA importar este módulo desde componentes cliente
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
