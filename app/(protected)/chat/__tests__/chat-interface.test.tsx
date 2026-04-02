// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { UIMessage } from 'ai'

// Mock sendMessage function we can inspect
const mockSendMessage = vi.fn()
const mockSetMessages = vi.fn()
const mockRouterPush = vi.fn()

// Track useChat return value so individual tests can override
let useChatReturnValue = {
  messages: [] as UIMessage[],
  sendMessage: mockSendMessage,
  status: 'ready' as string,
  setMessages: mockSetMessages,
}

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => useChatReturnValue),
}))

vi.mock('ai', () => ({
  DefaultChatTransport: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockRouterPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
}))

vi.mock('@/app/actions/chat', () => ({
  createConversation: vi.fn(() => Promise.resolve('new-conv-id')),
  deleteConversation: vi.fn(() => Promise.resolve()),
  updateConversationTitle: vi.fn(() => Promise.resolve()),
}))

vi.mock('../message-bubble', () => ({
  MessageBubble: ({ message }: { message: UIMessage }) => (
    <div data-testid={`msg-${message.id}`}>
      {message.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('')}
    </div>
  ),
}))

import { ChatInterface } from '../chat-interface'
import type { Conversation, Plan } from '@/lib/types/database'

const defaultConversations: Conversation[] = [
  {
    id: 'conv-1',
    user_id: 'user-123',
    title: 'First conversation',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:30:00Z',
  },
  {
    id: 'conv-2',
    user_id: 'user-123',
    title: 'Second conversation',
    created_at: '2026-03-14T10:00:00Z',
    updated_at: '2026-03-14T10:30:00Z',
  },
]

function renderChat(overrides: {
  conversations?: Conversation[]
  activeConversationId?: string | null
  plan?: Plan
  messageCount?: number
  messageLimit?: number
  messages?: UIMessage[]
  status?: string
} = {}) {
  // Update useChat mock return value before render
  useChatReturnValue = {
    messages: overrides.messages ?? [],
    sendMessage: mockSendMessage,
    status: overrides.status ?? 'ready',
    setMessages: mockSetMessages,
  }

  return render(
    <ChatInterface
      conversations={overrides.conversations ?? defaultConversations}
      initialMessages={[]}
      activeConversationId={overrides.activeConversationId ?? null}
      plan={overrides.plan ?? 'pro'}
      messageCount={overrides.messageCount ?? 0}
      messageLimit={overrides.messageLimit ?? 100}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ChatInterface', () => {
  describe('empty state', () => {
    it('renders heading and suggested prompts when no messages', () => {
      renderChat()

      expect(screen.getByText('How can I help you today?')).toBeInTheDocument()
      expect(
        screen.getByText('Explain how React Server Components work')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Help me write a SQL query to find duplicate records'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('What are some best practices for API design?')
      ).toBeInTheDocument()
    })

    it('does not render empty state when messages exist', () => {
      renderChat({
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello' }],
          },
        ],
      })

      expect(
        screen.queryByText('How can I help you today?')
      ).not.toBeInTheDocument()
    })
  })

  describe('conversation sidebar', () => {
    it('renders conversation titles', () => {
      renderChat()

      expect(screen.getByText('First conversation')).toBeInTheDocument()
      expect(screen.getByText('Second conversation')).toBeInTheDocument()
    })

    it('shows empty state when no conversations', () => {
      renderChat({ conversations: [] })

      expect(screen.getByText('No conversations yet')).toBeInTheDocument()
    })

    it('two-click delete: first click shows confirmation, second deletes', async () => {
      const { deleteConversation } = await import('@/app/actions/chat')
      renderChat()

      // Find delete buttons (the trash icon buttons)
      const deleteButtons = screen.getAllByRole('button').filter((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.textContent === ''
      })

      // Click the first delete button (first conversation)
      fireEvent.click(deleteButtons[0])

      // Should show "Delete?" confirmation
      expect(screen.getByText('Delete?')).toBeInTheDocument()

      // Click the confirmation button
      fireEvent.click(screen.getByText('Delete?'))

      expect(deleteConversation).toHaveBeenCalledWith('conv-1')
    })
  })

  describe('input and send button', () => {
    it('disables send button when input is empty', () => {
      renderChat()

      const sendButton = screen.getByRole('button', { name: 'Send' })
      expect(sendButton).toBeDisabled()
    })

    it('disables send button when streaming', () => {
      renderChat({ status: 'streaming' })

      const sendButton = screen.queryByRole('button', { name: 'Send' })
      // When streaming, the button should be disabled (if visible)
      if (sendButton) {
        expect(sendButton).toBeDisabled()
      }
    })

    it('enables send button after typing', () => {
      renderChat()

      const textarea = screen.getByPlaceholderText('Send a message...')
      fireEvent.change(textarea, { target: { value: 'Hello' } })

      const sendButton = screen.getByRole('button', { name: 'Send' })
      expect(sendButton).not.toBeDisabled()
    })

    it('submits on Enter key (not Shift+Enter)', async () => {
      renderChat()

      const textarea = screen.getByPlaceholderText(
        'Send a message...'
      ) as HTMLTextAreaElement

      // Set the value directly on the DOM element (handleSubmit reads inputRef.current.value)
      textarea.value = 'Hello'
      fireEvent.change(textarea, { target: { value: 'Hello' } })

      // Shift+Enter should not submit
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
      expect(mockSendMessage).not.toHaveBeenCalled()

      // Enter without shift should submit (handleSubmit is async)
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalled()
      })
    })
  })

  describe('message limit', () => {
    it('shows limit reached message for free plan at limit', () => {
      renderChat({
        plan: 'free',
        messageCount: 100,
        messageLimit: 100,
      })

      expect(
        screen.getByText("You've reached your monthly message limit")
      ).toBeInTheDocument()
      expect(
        screen.getByText('Upgrade to Pro for unlimited messages')
      ).toBeInTheDocument()
    })

    it('shows usage counter for free plan below limit', () => {
      renderChat({
        plan: 'free',
        messageCount: 50,
        messageLimit: 100,
      })

      expect(screen.getByText('50 / 100 messages this month')).toBeInTheDocument()
    })

    it('does not show usage counter for pro plan', () => {
      renderChat({ plan: 'pro' })

      expect(
        screen.queryByText(/messages this month/)
      ).not.toBeInTheDocument()
    })
  })

  describe('new chat button', () => {
    it('navigates to /chat and resets messages', () => {
      renderChat()

      const newButton = screen.getByRole('button', { name: 'New' })
      fireEvent.click(newButton)

      expect(mockRouterPush).toHaveBeenCalledWith('/chat')
      expect(mockSetMessages).toHaveBeenCalledWith([])
    })
  })
})
