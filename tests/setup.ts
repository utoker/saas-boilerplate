import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Stub `server-only` — it throws at import time outside a server environment
vi.mock('server-only', () => ({}))

// Stub `next/headers` — used by lib/supabase/server.ts
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Stub `next/navigation`
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
}))

// Stub React cache() — in tests, just pass the function through
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  }
})
