import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { processDocument } from '@/inngest/functions/processDocument'

// El SDK de Inngest verifica automáticamente la firma HMAC con INNGEST_SIGNING_KEY
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processDocument],
})
