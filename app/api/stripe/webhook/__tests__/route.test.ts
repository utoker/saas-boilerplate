import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '@/tests/mocks/supabase'
import { createMockStripe } from '@/tests/mocks/stripe'

const mockStripe = createMockStripe()
const { client: mockSupabaseAdmin, mockFrom } = createMockSupabase()

vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }))
vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: mockSupabaseAdmin }))

const { POST } = await import('@/app/api/stripe/webhook/route')

function makeRequest(body: string, signature: string | null = 'test-sig') {
  const headers = new Headers()
  if (signature) {
    headers.set('stripe-signature', signature)
  }
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123'
})

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const response = await POST(makeRequest('{}', null))
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error).toBe('Missing stripe-signature header')
  })

  it('returns 400 when signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const response = await POST(makeRequest('{}'))
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.error).toBe('Invalid signature')
  })

  describe('checkout.session.completed', () => {
    it('updates subscription to pro with period dates', async () => {
      const periodStart = 1711929600 // Unix timestamp
      const periodEnd = 1714521600

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'subscription',
            customer: 'cus_test',
            subscription: 'sub_test',
          },
        },
      })

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_test',
        items: {
          data: [{ current_period_start: periodStart, current_period_end: periodEnd }],
        },
      })

      const builder = mockFrom('subscriptions', { data: null, error: null })

      const response = await POST(makeRequest('{}'))
      expect(response.status).toBe(200)

      expect(builder.update).toHaveBeenCalledWith({
        stripe_subscription_id: 'sub_test',
        plan: 'pro',
        status: 'active',
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
      })
      expect(builder.eq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test')
    })

    it('skips non-subscription sessions', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'payment', // Not a subscription
            customer: 'cus_test',
          },
        },
      })

      const response = await POST(makeRequest('{}'))
      expect(response.status).toBe(200)

      // No database update should have been attempted
      expect(mockSupabaseAdmin.from).not.toHaveBeenCalled()
    })

    it('returns 500 when database update fails', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            mode: 'subscription',
            customer: 'cus_test',
            subscription: 'sub_test',
          },
        },
      })

      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: 'sub_test',
        items: {
          data: [{ current_period_start: 1711929600, current_period_end: 1714521600 }],
        },
      })

      mockFrom('subscriptions', {
        data: null,
        error: { message: 'DB error' },
      })

      const response = await POST(makeRequest('{}'))
      expect(response.status).toBe(500)
    })
  })

  describe('customer.subscription.updated', () => {
    function makeSubscriptionUpdatedEvent(
      priceId: string,
      status: string
    ) {
      return {
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_test',
            status,
            items: {
              data: [
                {
                  price: { id: priceId },
                  current_period_start: 1711929600,
                  current_period_end: 1714521600,
                },
              ],
            },
          },
        },
      }
    }

    it('sets plan to pro when price matches', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue(
        makeSubscriptionUpdatedEvent('price_pro_123', 'active')
      )

      const builder = mockFrom('subscriptions', { data: null, error: null })

      await POST(makeRequest('{}'))

      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'pro', status: 'active' })
      )
    })

    it('sets plan to free when price does not match', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue(
        makeSubscriptionUpdatedEvent('price_basic_456', 'active')
      )

      const builder = mockFrom('subscriptions', { data: null, error: null })

      await POST(makeRequest('{}'))

      expect(builder.update).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'free' })
      )
    })

    it.each([
      ['active', 'active'],
      ['trialing', 'active'],
      ['past_due', 'past_due'],
      ['canceled', 'canceled'],
      ['unpaid', 'canceled'],
      ['incomplete', 'incomplete'],
      ['paused', 'incomplete'],
    ] as const)(
      'maps Stripe status "%s" to app status "%s"',
      async (stripeStatus, expectedAppStatus) => {
        mockStripe.webhooks.constructEvent.mockReturnValue(
          makeSubscriptionUpdatedEvent('price_pro_123', stripeStatus)
        )

        const builder = mockFrom('subscriptions', { data: null, error: null })

        await POST(makeRequest('{}'))

        expect(builder.update).toHaveBeenCalledWith(
          expect.objectContaining({ status: expectedAppStatus })
        )
      }
    )
  })

  describe('customer.subscription.deleted', () => {
    it('resets subscription to free/canceled and clears stripe ID', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_test',
          },
        },
      })

      const builder = mockFrom('subscriptions', { data: null, error: null })

      const response = await POST(makeRequest('{}'))
      expect(response.status).toBe(200)

      expect(builder.update).toHaveBeenCalledWith({
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
      })
      expect(builder.eq).toHaveBeenCalledWith('stripe_customer_id', 'cus_test')
    })
  })

  it('returns 200 for unhandled event types', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    })

    const response = await POST(makeRequest('{}'))
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.received).toBe(true)
  })
})
