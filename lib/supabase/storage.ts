import { supabaseServer } from './server'

const BUCKET = 'documents'

export async function uploadToStorage(
  path: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
  return path
}

export async function getSignedUrl(path: string, expiresIn = 900): Promise<string> {
  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error) throw new Error(`Signed URL failed: ${error.message}`)
  return data.signedUrl
}

export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabaseServer.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Storage delete failed: ${error.message}`)
}

export async function downloadFromStorage(path: string): Promise<Buffer> {
  const { data, error } = await supabaseServer.storage.from(BUCKET).download(path)
  if (error) throw new Error(`Storage download failed: ${error.message}`)
  return Buffer.from(await data.arrayBuffer())
}
