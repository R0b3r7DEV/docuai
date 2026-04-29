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
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))

const mockStream = vi.hoisted(() => vi.fn().mockReturnValue({
  [Symbol.asyncIterator]: async function* () {
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hola' } }
  },
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: mockStream }
  },
}))

describe('POST /api/chat', () => {
  it('rechaza mensajes vacíos', async () => {
    const { POST } = await import('@/app/api/chat/route')
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})
