import { z } from 'zod'
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/types/app'

export const DocumentFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'done', 'error']).optional(),
  type: z
    .enum(['factura', 'presupuesto', 'nomina', 'contrato', 'albaran', 'extracto_bancario', 'balance', 'otro'])
    .optional(),
  category: z
    .enum(['suministros', 'servicios', 'personal', 'alquiler', 'material', 'impuestos', 'otro'])
    .optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  search: z.string().max(200).optional(),
})

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
})

export const ExportParamsSchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  type: z
    .enum(['factura', 'presupuesto', 'nomina', 'contrato', 'albaran', 'extracto_bancario', 'balance', 'otro'])
    .optional(),
  category: z
    .enum(['suministros', 'servicios', 'personal', 'alquiler', 'material', 'impuestos', 'otro'])
    .optional(),
})

export const UuidSchema = z.string().uuid()

export function validateMimeType(mimeType: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType)
}

export function validateFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES
}
