import { describe, it, expect, vi } from 'vitest'

// Tests de integración — requieren variables de entorno reales o mocks de Supabase
// Ejecutar con: pnpm test:integration (configuración separada en CI)

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test', protect: vi.fn() }),
}))

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

describe('GET /api/documents', () => {
  it('devuelve estructura paginada correcta', async () => {
    const { GET } = await import('@/app/api/documents/route')
    const req = new Request('http://localhost/api/documents?page=1&limit=20')
    const res = await GET(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
  })
})
