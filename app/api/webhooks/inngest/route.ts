import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { processDocument } from '@/inngest/functions/processDocument'
import { monthlySummary } from '@/inngest/functions/monthlySummary'

export const runtime = 'nodejs'
export const maxDuration = 60

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processDocument, monthlySummary],
})
