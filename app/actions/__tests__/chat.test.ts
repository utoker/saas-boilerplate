import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabase } from '@/tests/mocks/supabase'
import { mockUser, mockConversation, mockMessage } from '@/tests/mocks/user'

const { client: mockSupabaseClient, mockFrom } = createMockSupabase()

vi.mock('@/lib/dal', () => ({
  verifySession: vi.fn(() => Promise.resolve(mockUser)),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

const {
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
  updateConversationTitle,
} = await import('@/app/actions/chat')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createConversation', () => {
  it('returns new conversation ID on success', async () => {
    const builder = mockFrom('conversations', {
      data: { id: 'new-conv-id' },
      error: null,
    })

    const id = await createConversation()

    expect(id).toBe('new-conv-id')
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('conversations')
    expect(builder.insert).toHaveBeenCalledWith({ user_id: mockUser.id })
  })

  it('throws when insert fails', async () => {
    mockFrom('conversations', {
      data: null,
      error: { message: 'Insert failed' },
    })

    await expect(createConversation()).rejects.toThrow(
      'Failed to create conversation'
    )
  })
})

describe('getConversations', () => {
  it('returns conversations array', async () => {
    const conversations = [mockConversation]

    mockFrom('conversations', { data: conversations, error: null })

    const result = await getConversations()
    expect(result).toEqual(conversations)
  })

  it('returns empty array when data is null', async () => {
    mockFrom('conversations', { data: null, error: null })

    const result = await getConversations()
    expect(result).toEqual([])
  })

  it('throws on query error', async () => {
    mockFrom('conversations', {
      data: null,
      error: { message: 'Query failed' },
    })

    await expect(getConversations()).rejects.toThrow(
      'Failed to load conversations'
    )
  })
})

describe('getMessages', () => {
  it('returns messages for a conversation', async () => {
    const messages = [mockMessage]

    const builder = mockFrom('messages', { data: messages, error: null })

    const result = await getMessages('conv-1')

    expect(result).toEqual(messages)
    expect(builder.eq).toHaveBeenCalledWith('conversation_id', 'conv-1')
    expect(builder.order).toHaveBeenCalledWith('created_at', {
      ascending: true,
    })
  })

  it('returns empty array when data is null', async () => {
    mockFrom('messages', { data: null, error: null })

    const result = await getMessages('conv-1')
    expect(result).toEqual([])
  })

  it('throws on query error', async () => {
    mockFrom('messages', {
      data: null,
      error: { message: 'Query failed' },
    })

    await expect(getMessages('conv-1')).rejects.toThrow(
      'Failed to load messages'
    )
  })
})

describe('deleteConversation', () => {
  it('deletes conversation by ID', async () => {
    const builder = mockFrom('conversations', { data: null, error: null })

    await deleteConversation('conv-1')

    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 'conv-1')
  })

  it('throws on delete error', async () => {
    mockFrom('conversations', {
      data: null,
      error: { message: 'Delete failed' },
    })

    await expect(deleteConversation('conv-1')).rejects.toThrow(
      'Failed to delete conversation'
    )
  })
})

describe('updateConversationTitle', () => {
  it('updates title for the given conversation', async () => {
    const builder = mockFrom('conversations', { data: null, error: null })

    await updateConversationTitle('conv-1', 'New title')

    expect(builder.update).toHaveBeenCalledWith({ title: 'New title' })
    expect(builder.eq).toHaveBeenCalledWith('id', 'conv-1')
  })

  it('throws on update error', async () => {
    mockFrom('conversations', {
      data: null,
      error: { message: 'Update failed' },
    })

    await expect(
      updateConversationTitle('conv-1', 'New title')
    ).rejects.toThrow('Failed to update conversation title')
  })
})
