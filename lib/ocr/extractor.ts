import Tesseract from 'tesseract.js'
import { writeFile, access, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const LANGS = (process.env.TESSERACT_LANG ?? 'spa+eng').split('+')
const CACHE_DIR = join(tmpdir(), 'tessdata')

// Module-level state: avoids re-downloading on warm instances
let cacheReady = false
let useFallbackCDN = false

async function ensureTrainedData(): Promise<void> {
  if (cacheReady || useFallbackCDN) return

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    useFallbackCDN = true
    return
  }

  try {
    await mkdir(CACHE_DIR, { recursive: true })

    const base = `${supabaseUrl}/storage/v1/object/public/traineddata`

    await Promise.all(
      LANGS.map(async (lang) => {
        const dest = join(CACHE_DIR, `${lang}.traineddata`)

        // Skip if already downloaded on this warm instance
        try {
          await access(dest)
          return
        } catch {}

        const res = await fetch(`${base}/${lang}.traineddata`)
        if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${lang}.traineddata`)

        const buf = Buffer.from(await res.arrayBuffer())
        await writeFile(dest, buf)
        console.log(`[ocr] cached ${lang}.traineddata (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)
      })
    )

    cacheReady = true
  } catch (err) {
    // Traineddata files not yet in Storage → fall back to CDN (slower but works)
    console.warn('[ocr] Storage download failed, using CDN fallback:', err instanceof Error ? err.message : err)
    useFallbackCDN = true
  }
}

export async function extractTextFromImage(
  buffer: Buffer
): Promise<{ text: string; confidence: number }> {
  await ensureTrainedData()

  const lang = LANGS.join('+')
  const worker = await Tesseract.createWorker(lang, 1, {
    logger: () => undefined,
    // Use /tmp cache when available; fall back to default CDN otherwise
    ...(cacheReady ? { langPath: CACHE_DIR } : {}),
  })

  try {
    const result = await worker.recognize(buffer)
    const text = result.data.text.trim()
    const confidence = result.data.confidence

    console.log(`[ocr] confidence: ${confidence.toFixed(1)}%, chars: ${text.length}`)

    return { text, confidence }
  } finally {
    await worker.terminate()
  }
}
