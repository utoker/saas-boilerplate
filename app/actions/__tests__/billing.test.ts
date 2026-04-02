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

vi.mock('@/lib/stripe', () => ({
  stripe: {
    invoices: { list: vi.fn(() => Promise.resolve({ data: [] })) },
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: { from: vi.fn() },
}))

const { getSubscription, getMonthlyMessageCount, getBillingPeriodUsage, getInvoices } =
  await import('@/app/actions/billing')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSubscription', () => {
  it('returns subscription for authenticated user', async () => {
    const subData = {
      id: 'sub-1',
      user_id: mockUser.id,
      plan: 'pro' as const,
      status: 'active' as const,
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      current_period_start: '2026-03-01T00:00:00Z',
      current_period_end: '2026-04-01T00:00:00Z',
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    }

    mockFrom('subscriptions', { data: subData, error: null })

    const result = await getSubscription()
    expect(result).toEqual(subData)
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscriptions')
  })

  it('returns null when no subscription exists', async () => {
    mockFrom('subscriptions', { data: null, error: null })

    const result = await getSubscription()
    expect(result).toBeNull()
  })
})

describe('getMonthlyMessageCount', () => {
  it('returns count from RPC', async () => {
    mockRpc({ data: 42, error: null })

    const count = await getMonthlyMessageCount()
    expect(count).toBe(42)
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'count_user_messages_this_month',
      { uid: mockUser.id }
    )
  })

  it('returns 0 when RPC returns null', async () => {
    mockRpc({ data: null, error: null })

    const count = await getMonthlyMessageCount()
    expect(count).toBe(0)
  })

  it('throws on RPC error', async () => {
    mockRpc({ data: null, error: { message: 'RPC failed' } })

    await expect(getMonthlyMessageCount()).rejects.toThrow(
      'Failed to count messages'
    )
  })
})

describe('getBillingPeriodUsage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses Stripe period dates for pro users', async () => {
    mockFrom('subscriptions', {
      data: {
        plan: 'pro',
        current_period_start: '2026-03-01T00:00:00Z',
        current_period_end: '2026-04-01T00:00:00Z',
      },
      error: null,
    })

    // Mock conversations query (returns conversation IDs)
    mockFrom('conversations', {
      data: [{ id: 'conv-1' }],
      error: null,
      count: 2,
    })

    // Mock messages query
    mockFrom('messages', { data: null, error: null, count: 15 })

    const result = await getBillingPeriodUsage()

    expect(result.periodStart).toBe('2026-03-01T00:00:00Z')
    expect(result.periodEnd).toBe('2026-04-01T00:00:00Z')
  })

  it('uses calendar month for free users', async () => {
    mockFrom('subscriptions', {
      data: { plan: 'free', current_period_start: null, current_period_end: null },
      error: null,
    })

    mockFrom('conversations', { data: [], error: null, count: 0 })

    const result = await getBillingPeriodUsage()

    // Should use first of current month to first of next month
    expect(result.periodStart).toBe(
      new Date(2026, 2, 1).toISOString() // March 1
    )
    expect(result.periodEnd).toBe(
      new Date(2026, 3, 1).toISOString() // April 1
    )
  })

  it('uses calendar month when no subscription exists', async () => {
    mockFrom('subscriptions', { data: null, error: null })
    mockFrom('conversations', { data: [], error: null, count: 0 })

    const result = await getBillingPeriodUsage()

    expect(result.periodStart).toBe(new Date(2026, 2, 1).toISOString())
    expect(result.periodEnd).toBe(new Date(2026, 3, 1).toISOString())
  })

  it('returns zero message count when no conversations exist', async () => {
    mockFrom('subscriptions', {
      data: { plan: 'free', current_period_start: null, current_period_end: null },
      error: null,
    })

    mockFrom('conversations', { data: [], error: null, count: 0 })

    const result = await getBillingPeriodUsage()
    expect(result.messageCount).toBe(0)
  })
})

describe('getInvoices', () => {
  it('returns empty array when no stripe customer', async () => {
    mockFrom('subscriptions', {
      data: { stripe_customer_id: null },
      error: null,
    })

    const invoices = await getInvoices()
    expect(invoices).toEqual([])
  })
})
