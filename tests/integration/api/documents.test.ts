import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockUser = {
  id: 'user_test',
  email: 'test@test.com',
  full_name: 'Test User',
  organization_id: 'org_test',
  role: 'owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockProtect = vi.fn().mockResolvedValue(undefined)
const mockAuth = Object.assign(
  vi.fn().mockResolvedValue({ userId: 'user_test' }),
  { protect: mockProtect }
)

vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    }),
  },
}))

describe('GET /api/documents', () => {
  it('devuelve estructura paginada correcta', async () => {
    const { GET } = await import('@/app/api/documents/route')
    const req = new NextRequest('http://localhost/api/documents?page=1&limit=20')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
  })
})
