import { vi } from 'vitest'
import type { User, AuthError } from '@supabase/supabase-js'

type SupabaseResponse<T = unknown> = {
  data: T | null
  error: { message: string } | null
  count?: number | null
}

/**
 * Creates a chainable query builder mock.
 * Chain methods return `this`, terminal methods resolve with the configured response.
 */
export function createQueryBuilder<T = unknown>(
  response: SupabaseResponse<T> = { data: null, error: null }
) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}

  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in',
    'order', 'limit', 'range', 'filter', 'match',
  ]

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder)
  }

  // Terminal methods
  builder.single = vi.fn(() => Promise.resolve(response))
  builder.maybeSingle = vi.fn(() => Promise.resolve(response))

  // Make builder await-able by adding a thenable
  builder.then = vi.fn(
    (resolve: (value: SupabaseResponse<T>) => void) => resolve(response)
  )

  return builder
}

/**
 * Creates a mock Supabase client with configurable per-table responses.
 */
export function createMockSupabase() {
  const tableBuilders = new Map<string, ReturnType<typeof createQueryBuilder>>()

  const client = {
    from: vi.fn((table: string) => {
      if (!tableBuilders.has(table)) {
        tableBuilders.set(table, createQueryBuilder())
      }
      return tableBuilders.get(table)!
    }),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    auth: {
      // Cast widens the inferred literal `null` to the real union types so
      // tests can `mockResolvedValue` with actual User / AuthError payloads.
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: null as User | null },
          error: null as AuthError | null,
        })
      ),
    },
  }

  function mockFrom<T = unknown>(table: string, response: SupabaseResponse<T>) {
    const builder = createQueryBuilder(response)
    tableBuilders.set(table, builder)
    return builder
  }

  function mockRpc<T = unknown>(response: SupabaseResponse<T>) {
    ;(client.rpc as ReturnType<typeof vi.fn>).mockResolvedValue(response)
  }

  return { client, mockFrom, mockRpc }
}
