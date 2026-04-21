import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
      stream: vi.fn(),
    },
  })),
}))

describe('extractDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extrae campos de una factura en texto plano', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const mockCreate = vi.fn().mockResolvedValue({
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
    ;(Anthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      messages: { create: mockCreate },
    }))

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
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    ;(Anthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'No tengo información suficiente.' }],
        }),
      },
    }))

    const { extractDocument } = await import('@/lib/claude/extractor')
    await expect(
      extractDocument({ rawText: 'texto', mimeType: 'text/plain' })
    ).rejects.toThrow()
  })
})
