// Public aliases for consumers. Derived from the generated schema types
// in ./database.generated.ts so there's a single source of truth for DB
// shapes. A few `text` columns are narrowed to literal unions where the
// application enforces a closed set of values (role, plan, status).

import type { Database } from './database.generated'

export type { Database }

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type Conversation = Tables['conversations']['Row']

export type Plan = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'

// `messages.role`, `subscriptions.plan`, and `subscriptions.status` are
// plain `text` columns in Postgres, so the generator emits `string`.
// Narrow them here to preserve the union types the app code relies on.
export type Message = Omit<Tables['messages']['Row'], 'role'> & {
  role: 'user' | 'assistant'
}

export type Subscription = Omit<
  Tables['subscriptions']['Row'],
  'plan' | 'status'
> & {
  plan: Plan
  status: SubscriptionStatus
}

// Application type, not DB-backed.
export type ChatRequest = {
  conversation_id: string
  message: string
}
