import Anthropic from '@anthropic-ai/sdk'
import { ClaudeExtractionSchema, type ClaudeExtraction } from './schemas'
import { SYSTEM_EXTRACTION_PROMPT } from './prompts'

const MODEL = 'claude-sonnet-4-6'
const MAX_RETRIES = 3

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExtractorInput {
  /** Raw extracted text (PDF via pdf-parse, or plain text file) */
  rawText?: string
  /** Base64-encoded image data for image files (jpeg, png, webp) */
  base64Image?: string
  /** Base64-encoded PDF data for small PDFs sent as document block */
  base64Pdf?: string
  mimeType: string
}

/** Typed extraction result returned by extractDocumentData */
export type ClaudeExtractionPayload = ClaudeExtraction

const JSON_SCHEMA_HINT = JSON.stringify({
  type: 'factura|presupuesto|nomina|contrato|albaran|extracto_bancario|balance|otro',
  issue_date: 'YYYY-MM-DD o null',
  vendor: 'nombre proveedor o null',
  concept: 'descripción breve o null',
  amount: 'número o null',
  currency: 'EUR',
  category: 'suministros|servicios|personal|alquiler|material|impuestos|otro',
  confidence_score: 0.9,
  additional_fields: {},
})

function buildContent(input: ExtractorInput): Anthropic.MessageParam['content'] {
  const content: Anthropic.MessageParam['content'] = []

  if (input.rawText) {
    // text/plain or PDF parsed via pdf-parse
    content.push({
      type: 'text',
      text: `Documento:\n\n${input.rawText}`,
    })
  } else if (input.base64Pdf) {
    // PDF ≤ 4 MB sent as document block
    content.push({
      type: 'document',
      source: {
        type: 'base64',
        media_type: 'application/pdf',
        data: input.base64Pdf,
      },
    } as Anthropic.DocumentBlockParam)
  } else if (input.base64Image) {
    // Image file sent as image block
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        data: input.base64Image,
      },
    })
  }

  content.push({
    type: 'text',
    text: `Extrae la información del documento y devuelve ÚNICAMENTE JSON con este schema:\n${JSON_SCHEMA_HINT}`,
  })

  return content
}

async function callClaude(input: ExtractorInput): Promise<ClaudeExtractionPayload> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_EXTRACTION_PROMPT,
    messages: [{ role: 'user', content: buildContent(input) }],
  })

  const text = response.content.find((b) => b.type === 'text')?.text ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Claude no devolvió JSON válido. Respuesta: ${text.slice(0, 200)}`)

  return ClaudeExtractionSchema.parse(JSON.parse(jsonMatch[0]))
}

/**
 * Extract structured data from a document using Claude.
 * Retries up to MAX_RETRIES times with exponential backoff on rate limit errors only.
 * Never throws without exhausting retries.
 */
export async function extractDocumentData(input: ExtractorInput): Promise<ClaudeExtractionPayload> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await callClaude(input)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const isRateLimit =
        err instanceof Anthropic.RateLimitError ||
        lastError.message.includes('rate_limit') ||
        lastError.message.includes('429')

      if (!isRateLimit || attempt === MAX_RETRIES - 1) throw lastError

      // 2^(attempt+1) seconds: 2s, 4s, 8s
      const delayMs = Math.pow(2, attempt + 1) * 1000
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  throw lastError
}

/** @deprecated Use extractDocumentData */
export const extractDocument = extractDocumentData
