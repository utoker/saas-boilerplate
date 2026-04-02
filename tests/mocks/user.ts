import type { Conversation, Message, Subscription } from '@/lib/types/database'

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-03-01T00:00:00Z',
} as const

export const mockConversation: Conversation = {
  id: 'conv-1',
  user_id: 'user-123',
  title: 'Test conversation',
  created_at: '2026-03-15T10:00:00Z',
  updated_at: '2026-03-15T10:30:00Z',
}

export const mockMessage: Message = {
  id: 'msg-1',
  conversation_id: 'conv-1',
  role: 'user',
  content: 'Hello, world!',
  input_tokens: null,
  output_tokens: null,
  created_at: '2026-03-15T10:00:00Z',
}

export const mockSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-123',
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: 'sub_test123',
  plan: 'pro',
  status: 'active',
  current_period_start: '2026-03-01T00:00:00Z',
  current_period_end: '2026-04-01T00:00:00Z',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
}
