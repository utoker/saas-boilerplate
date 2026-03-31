export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
}

export type Plan = 'free' | 'pro'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type ChatRequest = {
  conversation_id: string
  message: string
}
