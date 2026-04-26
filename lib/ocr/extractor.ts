import Tesseract from 'tesseract.js'

const lang = process.env.TESSERACT_LANG ?? 'spa+eng'

export async function extractTextFromImage(
  buffer: Buffer
): Promise<{ text: string; confidence: number }> {
  const worker = await Tesseract.createWorker(lang, 1, {
    logger: () => undefined, // silence progress logs
  })

  try {
    const result = await worker.recognize(buffer)
    const text = result.data.text.trim()
    const confidence = result.data.confidence // 0-100

    console.log(`[ocr] confidence: ${confidence.toFixed(1)}%, chars: ${text.length}`)

    return { text, confidence }
  } finally {
    await worker.terminate()
  }
}
