import path from 'path'
import fs from 'fs'
import { preprocessImage } from '../lib/ocr/preprocess'
import { extractTextFromImage } from '../lib/ocr/extractor'
import { runOCR } from '../lib/ocr/index'

const TEST_IMAGE_PATH = path.join(process.cwd(), 'public', 'test-invoice.jpg')

async function downloadTestImage(): Promise<Buffer> {
  // Use a public domain sample invoice image
  const url = 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg'
  console.log(`[test-ocr] Downloading test image from ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch test image: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  console.log('[test-ocr] Starting OCR pipeline test\n')
  const start = Date.now()

  let buffer: Buffer
  if (fs.existsSync(TEST_IMAGE_PATH)) {
    console.log(`[test-ocr] Using existing image: ${TEST_IMAGE_PATH}`)
    buffer = fs.readFileSync(TEST_IMAGE_PATH)
  } else {
    buffer = await downloadTestImage()
    fs.mkdirSync(path.dirname(TEST_IMAGE_PATH), { recursive: true })
    fs.writeFileSync(TEST_IMAGE_PATH, buffer)
    console.log(`[test-ocr] Saved test image to ${TEST_IMAGE_PATH}`)
  }

  console.log(`[test-ocr] Input size: ${(buffer.length / 1024).toFixed(1)} KB`)

  // Step 1: preprocess
  console.log('\n[test-ocr] Step 1: Preprocessing image...')
  const preprocessed = await preprocessImage(buffer)
  console.log(`[test-ocr] Preprocessed size: ${(preprocessed.length / 1024).toFixed(1)} KB`)

  // Step 2: OCR
  console.log('\n[test-ocr] Step 2: Running Tesseract OCR...')
  const { text, confidence } = await extractTextFromImage(preprocessed)
  console.log(`[test-ocr] Confidence: ${confidence.toFixed(1)}%`)
  console.log(`[test-ocr] Characters extracted: ${text.length}`)

  if (text.length > 0) {
    console.log('\n[test-ocr] Extracted text (first 500 chars):')
    console.log('─'.repeat(60))
    console.log(text.slice(0, 500))
    console.log('─'.repeat(60))
  }

  // Step 3: full pipeline decision
  console.log('\n[test-ocr] Step 3: Full runOCR decision...')
  const result = await runOCR(buffer, 'image/jpeg')
  console.log(`[test-ocr] OCR used: ${result.used}`)
  console.log(`[test-ocr] Confidence: ${result.confidence.toFixed(1)}%`)
  if (result.used) {
    console.log('[test-ocr] ✓ Text would be sent to Claude (cheaper path)')
  } else {
    console.log('[test-ocr] → Image would be sent to Claude directly (fallback path)')
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n[test-ocr] Total time: ${elapsed}s`)
  console.log('[test-ocr] Done.')
}

main().catch(err => {
  console.error('[test-ocr] Fatal error:', err)
  process.exit(1)
})
