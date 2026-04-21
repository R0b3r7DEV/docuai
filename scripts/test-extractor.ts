/**
 * Manual test for the Claude extractor.
 * Usage: pnpm test:extractor
 *
 * Reads public/test-doc.pdf (or falls back to inline text) and prints extraction JSON.
 * Requires ANTHROPIC_API_KEY to be set in .env.local or environment.
 */
import path from 'path'
import fs from 'fs'
import { config } from 'dotenv'

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') })

import { extractDocumentData } from '../lib/claude/extractor'

const { PDFParse } = require('pdf-parse') as {
  PDFParse: new (opts: { data: Uint8Array }) => { getText(): Promise<{ text: string }> }
}

const PDF_DIRECT_THRESHOLD_BYTES = 4 * 1024 * 1024

async function main() {
  const testPdfPath = path.join(process.cwd(), 'public', 'test-doc.pdf')

  let extractorInput: Parameters<typeof extractDocumentData>[0]

  if (fs.existsSync(testPdfPath)) {
    const buffer = fs.readFileSync(testPdfPath)
    const sizeBytes = buffer.length
    const mimeType = 'application/pdf'
    console.log(`Cargando ${testPdfPath} (${sizeBytes} bytes)`)

    if (sizeBytes > PDF_DIRECT_THRESHOLD_BYTES) {
      console.log('PDF grande → extrayendo texto con pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      const parsed = await parser.getText()
      const rawText = parsed.text.slice(0, 500_000)
      console.log('Texto extraído (primeros 300 chars):', rawText.slice(0, 300))
      extractorInput = { rawText, mimeType }
    } else {
      console.log('PDF pequeño → enviando como document block')
      extractorInput = { base64Pdf: buffer.toString('base64'), mimeType }
    }
  } else {
    // Fallback: hardcoded invoice text
    console.log('test-doc.pdf no encontrado, usando texto de factura de ejemplo')
    const rawText = `FACTURA NUM: 2024-001
Proveedor: Acme Solutions S.L.
NIF: B-12345678
Fecha de emisión: 15/01/2024
Concepto: Servicios de consultoría IT
Base imponible: 1.000,00 EUR
IVA 21%: 210,00 EUR
TOTAL FACTURA: 1.210,00 EUR`
    extractorInput = { rawText, mimeType: 'application/pdf' }
  }

  console.log('\nLlamando a Claude…')
  const start = Date.now()
  const result = await extractDocumentData(extractorInput)
  const elapsed = Date.now() - start

  console.log(`\n✓ Extracción completada en ${elapsed}ms\n`)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error('Error:', err.message ?? err)
  process.exit(1)
})
