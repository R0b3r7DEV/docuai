import { z } from 'zod'

export const ExtractionTypeSchema = z.enum([
  'factura',
  'presupuesto',
  'nomina',
  'contrato',
  'albaran',
  'extracto_bancario',
  'balance',
  'otro',
])

export const ExtractionCategorySchema = z.enum([
  'suministros',
  'servicios',
  'personal',
  'alquiler',
  'material',
  'impuestos',
  'otro',
])

export const ClaudeExtractionSchema = z.object({
  type: ExtractionTypeSchema,
  issue_date: z.string().nullable().describe('Fecha en formato YYYY-MM-DD o null'),
  vendor: z.string().nullable().describe('Nombre del proveedor o emisor'),
  concept: z.string().nullable().describe('Descripción breve del documento'),
  amount: z.number().nullable().describe('Importe total numérico'),
  currency: z.string().default('EUR').describe('Código ISO de moneda (ej: EUR, USD)'),
  category: ExtractionCategorySchema,
  confidence_score: z
    .number()
    .min(0)
    .max(1)
    .describe('Confianza en la extracción entre 0 y 1'),
  additional_fields: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Campos extra específicos del tipo de documento'),
})

export type ClaudeExtraction = z.infer<typeof ClaudeExtractionSchema>
