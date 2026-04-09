import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '@/tests/mocks/supabase'
import { mockUser } from '@/tests/mocks/user'

const { client: mockSupabaseClient, mockFrom } = createMockSupabase()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Import after mocks are set up
const { getUser, verifySession, getProfile, getSubscription } = await import(
  '@/lib/dal'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUser', () => {
  it('returns user when authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const user = await getUser()
    expect(user).toEqual(mockUser)
  })

  it('returns null when not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const user = await getUser()
    expect(user).toBeNull()
  })

  it('returns null on auth error', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      // Partial AuthError — the production code only reads `error` as a
      // truthy check, so shape fidelity doesn't matter here.
      error: { message: 'Invalid token' } as unknown as import('@supabase/supabase-js').AuthError,
    })

    const user = await getUser()
    expect(user).toBeNull()
  })
})

describe('verifySession', () => {
  it('returns user when authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const user = await verifySession()
    expect(user).toEqual(mockUser)
  })

  it('calls redirect when not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(verifySession()).rejects.toThrow('REDIRECT:/login')
  })
})

describe('getProfile', () => {
  it('returns profile for authenticated user', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const profileData = {
      id: mockUser.id,
      display_name: 'Test User',
      avatar_url: null,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    }

    mockFrom('profiles', { data: profileData, error: null })

    const profile = await getProfile()
    expect(profile).toEqual(profileData)
  })

  it('returns null when no profile exists', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockFrom('profiles', { data: null, error: null })

    const profile = await getProfile()
    expect(profile).toBeNull()
  })
})

describe('getSubscription', () => {
  it('returns subscription for authenticated user', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const subData = {
      id: 'sub-1',
      user_id: mockUser.id,
      plan: 'pro' as const,
      status: 'active' as const,
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      current_period_start: null,
      current_period_end: null,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-01T00:00:00Z',
    }

    mockFrom('subscriptions', { data: subData, error: null })

    const subscription = await getSubscription()
    expect(subscription).toEqual(subData)
  })
})
