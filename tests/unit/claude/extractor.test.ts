import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

describe('extractDocument', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('extrae campos de una factura en texto plano', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'factura',
            issue_date: '2025-01-15',
            vendor: 'Iberdrola S.A.',
            concept: 'Factura de electricidad enero 2025',
            amount: 234.56,
            currency: 'EUR',
            category: 'suministros',
            confidence_score: 0.95,
          }),
        },
      ],
    })

    const { extractDocument } = await import('@/lib/claude/extractor')
    const result = await extractDocument({
      rawText: 'Factura Iberdrola enero 2025 Total: 234,56€',
      mimeType: 'text/plain',
    })

    expect(result.type).toBe('factura')
    expect(result.vendor).toBe('Iberdrola S.A.')
    expect(result.amount).toBe(234.56)
    expect(result.confidence_score).toBeGreaterThan(0)
  })

  it('lanza error si Claude no devuelve JSON válido', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'No tengo información suficiente.' }],
    })

    const { extractDocument } = await import('@/lib/claude/extractor')
    await expect(
      extractDocument({ rawText: 'texto', mimeType: 'text/plain' })
    ).rejects.toThrow()
  })
})
