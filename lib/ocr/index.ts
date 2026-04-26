import { preprocessImage } from './preprocess'
import { extractTextFromImage } from './extractor'

const CONFIDENCE_THRESHOLD = 60
const MIN_TEXT_LENGTH = 50

export interface OCRResult {
  text: string
  confidence: number
  used: boolean
}

export async function runOCR(buffer: Buffer, mimeType: string): Promise<OCRResult> {
  if (!mimeType.startsWith('image/')) {
    return { text: '', confidence: 0, used: false }
  }

  try {
    const preprocessed = await preprocessImage(buffer)
    const { text, confidence } = await extractTextFromImage(preprocessed)

    if (confidence >= CONFIDENCE_THRESHOLD && text.length >= MIN_TEXT_LENGTH) {
      return { text, confidence, used: true }
    }

    console.log(`[ocr] confidence too low or text too short (${confidence.toFixed(1)}%, ${text.length} chars) — falling back to image`)
    return { text: '', confidence, used: false }
  } catch (err) {
    console.error('[ocr] error during OCR pipeline:', err)
    return { text: '', confidence: 0, used: false }
  }
}
