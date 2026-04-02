import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMockSupabase } from '@/tests/mocks/supabase'
import { mockUser } from '@/tests/mocks/user'

const { client: mockSupabaseClient, mockFrom, mockRpc } = createMockSupabase()

vi.mock('@/lib/dal', () => ({
  verifySession: vi.fn(() => Promise.resolve(mockUser)),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

const { getMessagesPerDay, getRecentActivity } = await import(
  '@/app/actions/dashboard'
)

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-31T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getMessagesPerDay', () => {
  it('returns 14-day array with RPC data filled in', async () => {
    mockRpc({
      data: [
        { date: '2026-03-30', count: 5 },
        { date: '2026-03-25', count: 3 },
      ],
      error: null,
    })

    const result = await getMessagesPerDay()

    expect(result).toHaveLength(14)
    expect(result[0].date).toBe('2026-03-18')
    expect(result[13].date).toBe('2026-03-31')

    const march30 = result.find((d) => d.date === '2026-03-30')
    expect(march30?.count).toBe(5)

    const march25 = result.find((d) => d.date === '2026-03-25')
    expect(march25?.count).toBe(3)

    // Days without data should be zero
    const march29 = result.find((d) => d.date === '2026-03-29')
    expect(march29?.count).toBe(0)
  })

  it('returns all zeros when RPC returns null data', async () => {
    mockRpc({ data: null, error: null })

    const result = await getMessagesPerDay()

    expect(result).toHaveLength(14)
    expect(result.every((d) => d.count === 0)).toBe(true)
  })

  it('returns empty array on RPC error', async () => {
    mockRpc({ data: null, error: { message: 'RPC failed' } })

    const result = await getMessagesPerDay()
    expect(result).toEqual([])
  })

  it('calls RPC with correct parameters', async () => {
    mockRpc({ data: [], error: null })

    await getMessagesPerDay()

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'get_user_messages_per_day',
      { uid: mockUser.id, days: 14 }
    )
  })
})

describe('getRecentActivity', () => {
  it('merges conversations, subscriptions, and profile into sorted events', async () => {
    mockFrom('conversations', {
      data: [
        {
          id: 'c1',
          title: 'First chat',
          created_at: '2026-03-30T10:00:00Z',
        },
      ],
      error: null,
    })

    mockFrom('subscriptions', {
      data: [
        {
          id: 's1',
          plan: 'pro',
          status: 'active',
          created_at: '2026-03-01T00:00:00Z',
          updated_at: '2026-03-29T00:00:00Z',
        },
      ],
      error: null,
    })

    mockFrom('profiles', {
      data: {
        id: mockUser.id,
        created_at: '2026-03-01T00:00:00Z',
      },
      error: null,
    })

    const events = await getRecentActivity()

    expect(events.length).toBeGreaterThanOrEqual(2)
    // Most recent event should be first (conversation on March 30)
    expect(events[0].type).toBe('conversation_created')
    expect(events[0].description).toBe('First chat')

    // Subscription event should be present
    const subEvent = events.find((e) => e.type === 'subscription_changed')
    expect(subEvent).toBeDefined()
    expect(subEvent?.title).toBe('Upgraded to Pro')
  })

  it('excludes subscriptions where updated_at equals created_at', async () => {
    mockFrom('conversations', { data: [], error: null })
    mockFrom('subscriptions', {
      data: [
        {
          id: 's1',
          plan: 'free',
          status: 'active',
          created_at: '2026-03-01T00:00:00Z',
          updated_at: '2026-03-01T00:00:00Z', // same as created_at
        },
      ],
      error: null,
    })
    mockFrom('profiles', {
      data: { id: mockUser.id, created_at: '2026-03-01T00:00:00Z' },
      error: null,
    })

    const events = await getRecentActivity()

    const subEvents = events.filter((e) => e.type === 'subscription_changed')
    expect(subEvents).toHaveLength(0)
  })

  it('caps results at 5 events', async () => {
    const manyConversations = Array.from({ length: 6 }, (_, i) => ({
      id: `c${i}`,
      title: `Chat ${i}`,
      created_at: `2026-03-${String(20 + i).padStart(2, '0')}T10:00:00Z`,
    }))

    mockFrom('conversations', { data: manyConversations, error: null })
    mockFrom('subscriptions', { data: [], error: null })
    mockFrom('profiles', {
      data: { id: mockUser.id, created_at: '2026-03-01T00:00:00Z' },
      error: null,
    })

    const events = await getRecentActivity()
    expect(events.length).toBeLessThanOrEqual(5)
  })

  it('handles null data gracefully', async () => {
    mockFrom('conversations', { data: null, error: null })
    mockFrom('subscriptions', { data: null, error: null })
    mockFrom('profiles', { data: null, error: null })

    const events = await getRecentActivity()
    expect(events).toEqual([])
  })
})
