import { vi } from 'vitest'

export function createMockStripe() {
  return {
    webhooks: {
      constructEvent: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
    },
    invoices: {
      list: vi.fn(() => Promise.resolve({ data: [] })),
    },
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: { create: vi.fn() },
    },
    billingPortal: {
      sessions: { create: vi.fn() },
    },
  }
}
