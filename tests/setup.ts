import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock variables de entorno para tests
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
