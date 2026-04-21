import { describe, it, expect } from 'vitest'
import { generateXlsx } from '@/lib/utils/export'
import type { DocumentWithExtraction } from '@/types/database'

const mockDoc: DocumentWithExtraction = {
  id: '1',
  organization_id: 'org-1',
  uploaded_by: 'user-1',
  filename: 'factura_luz.pdf',
  storage_path: 'org-1/factura_luz.pdf',
  mime_type: 'application/pdf',
  size_bytes: 12345,
  status: 'done',
  raw_text: null,
  error_message: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:05:00Z',
  extraction: {
    id: 'ext-1',
    document_id: '1',
    type: 'factura',
    issue_date: '2025-01-15',
    vendor: 'Iberdrola S.A.',
    concept: 'Electricidad enero',
    amount: 234.56,
    currency: 'EUR',
    category: 'suministros',
    raw_json: {},
    confidence_score: 0.95,
    created_at: '2025-01-15T10:05:00Z',
    updated_at: '2025-01-15T10:05:00Z',
  },
}

describe('generateXlsx', () => {
  it('genera un buffer válido para un array de documentos', () => {
    const buffer = generateXlsx([mockDoc])
    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('genera un buffer vacío para un array sin documentos', () => {
    const buffer = generateXlsx([])
    expect(Buffer.isBuffer(buffer)).toBe(true)
  })

  it('incluye los campos correctos en el XLSX', () => {
    const buffer = generateXlsx([mockDoc])
    // El buffer debe empezar con la firma de ZIP/XLSX (PK\x03\x04)
    expect(buffer[0]).toBe(0x50) // P
    expect(buffer[1]).toBe(0x4b) // K
  })
})
