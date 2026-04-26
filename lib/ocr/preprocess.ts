import sharp from 'sharp'

const MIN_WIDTH = 1500

export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer)
  const meta = await image.metadata()

  const needsResize = (meta.width ?? 0) < MIN_WIDTH

  let pipeline = sharp(buffer).greyscale()

  if (needsResize) {
    pipeline = pipeline.resize({ width: MIN_WIDTH, withoutEnlargement: false })
  }

  return pipeline
    .normalize()
    .sharpen({ sigma: 1.5 })
    .linear(1.4, -(128 * 0.4)) // contrast boost: multiply by 1.4, adjust midpoint
    .toFormat('png')
    .toBuffer()
}
