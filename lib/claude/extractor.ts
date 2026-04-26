import Anthropic from '@anthropic-ai/sdk'
import { ClaudeExtractionSchema, type ClaudeExtraction } from './schemas'
import { SYSTEM_EXTRACTION_PROMPT } from './prompts'
import { runOCR, type OCRResult } from '@/lib/ocr'

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

/** OCR metadata attached to the result when an image was processed */
export interface ExtractionOCRMeta {
  used: boolean
  confidence: number
}

/** Typed extraction result — carries OCR metadata for image inputs */
export type ClaudeExtractionPayload = ClaudeExtraction & { _ocr?: ExtractionOCRMeta }

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

function buildContent(
  input: ExtractorInput,
  ocrHint?: string
): Anthropic.MessageParam['content'] {
  const content: Anthropic.MessageParam['content'] = []

  if (ocrHint) {
    // OCR text replaces the image block — cheaper and more reliable
    content.push({
      type: 'text',
      text: `Documento:\n\n${ocrHint}`,
    })
  } else if (input.rawText) {
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
    // Image file sent as image block (OCR fallback or non-image path)
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

async function callClaude(
  input: ExtractorInput,
  ocrHint?: string
): Promise<ClaudeExtractionPayload> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_EXTRACTION_PROMPT,
    messages: [{ role: 'user', content: buildContent(input, ocrHint) }],
  })

  const text = response.content.find((b) => b.type === 'text')?.text ?? ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`Claude no devolvió JSON válido. Respuesta: ${text.slice(0, 200)}`)

  return ClaudeExtractionSchema.parse(JSON.parse(jsonMatch[0]))
}

/**
 * Extract structured data from a document using Claude.
 * For image inputs, runs OCR first — if confidence is sufficient the text is sent
 * to Claude instead of the image (cheaper and more reliable).
 * Retries up to MAX_RETRIES times with exponential backoff on rate limit errors only.
 */
export async function extractDocumentData(input: ExtractorInput): Promise<ClaudeExtractionPayload> {
  // OCR pre-processing for image inputs
  let ocr: OCRResult | undefined
  let ocrHint: string | undefined

  if (input.base64Image && input.mimeType.startsWith('image/')) {
    const buffer = Buffer.from(input.base64Image, 'base64')
    ocr = await runOCR(buffer, input.mimeType)
    if (ocr.used) {
      ocrHint = `[Texto extraído por OCR — confianza: ${ocr.confidence.toFixed(1)}%. Puede contener errores menores.]\n\n${ocr.text}`
    }
  }

  let lastError: Error | undefined

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await callClaude(input, ocrHint)
      // Attach OCR metadata so the caller (Inngest step) can persist it
      if (ocr) {
        result._ocr = { used: ocr.used, confidence: ocr.confidence }
      }
      return result
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
