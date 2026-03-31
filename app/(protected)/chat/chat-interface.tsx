'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { UIMessage } from 'ai'
import type { Conversation, Message, Plan } from '@/lib/types/database'
import {
  createConversation,
  deleteConversation,
  updateConversationTitle,
} from '@/app/actions/chat'
import { MessageBubble } from './message-bubble'

function dbMessagesToUIMessages(dbMessages: Message[]): UIMessage[] {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }],
  }))
}

export function ChatInterface({
  conversations: initialConversations,
  initialMessages,
  activeConversationId,
  plan,
  messageCount: initialMessageCount,
  messageLimit,
}: {
  conversations: Conversation[]
  initialMessages: Message[]
  activeConversationId: string | null
  plan: Plan
  messageCount: number
  messageLimit: number
}) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [conversationId, _setConversationId] = useState(activeConversationId)
  const conversationIdRef = useRef(activeConversationId)
  function setConversationId(id: string | null) {
    conversationIdRef.current = id
    _setConversationId(id)
  }
  const [conversations, setConversations] = useState(initialConversations)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messageCount, setMessageCount] = useState(initialMessageCount)
  const [limitReached, setLimitReached] = useState(false)
  const hasAutoTitled = useRef(false)
  const isFree = plan === 'free'
  const atLimit = isFree && messageCount >= messageLimit

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ conversation_id: conversationIdRef.current }),
      }),
    []
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: dbMessagesToUIMessages(initialMessages),
    onFinish: async () => {
      // Auto-title after first assistant response
      if (conversationId && !hasAutoTitled.current && messages.length <= 2) {
        hasAutoTitled.current = true
        const firstUserMsg = messages.find((m) => m.role === 'user')
        if (firstUserMsg) {
          const textPart = firstUserMsg.parts.find((p) => p.type === 'text')
          if (textPart && textPart.type === 'text') {
            const title = textPart.text.slice(0, 50) + (textPart.text.length > 50 ? '...' : '')
            await updateConversationTitle(conversationId, title)
            setConversations((prev) =>
              prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
            )
          }
        }
      }
    },
    onError: (error) => {
      if (error.message?.includes('403')) {
        setLimitReached(true)
      }
      console.error('Chat error:', error)
    },
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [conversationId])

  async function handleSubmit(e: { preventDefault?: () => void }) {
    e.preventDefault?.()
    const text = inputRef.current?.value.trim()
    if (!text || isStreaming || atLimit || limitReached) return

    let currentConversationId = conversationId

    // Create a new conversation if needed
    if (!currentConversationId) {
      currentConversationId = await createConversation()
      setConversationId(currentConversationId)
      setConversations((prev) => [
        {
          id: currentConversationId!,
          user_id: '',
          title: 'New conversation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ])
      hasAutoTitled.current = false
    }

    inputRef.current!.value = ''
    if (isFree) setMessageCount((c) => c + 1)
    sendMessage({
      text,
    })
  }

  function handleNewChat() {
    setConversationId(null)
    setMessages([])
    hasAutoTitled.current = false
    router.push('/chat')
  }

  function handleSelectConversation(id: string) {
    setConversationId(id)
    router.push(`/chat?conversation=${id}`)
  }

  async function handleDeleteConversation(
    e: React.MouseEvent,
    id: string
  ) {
    e.stopPropagation()
    await deleteConversation(id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (conversationId === id) {
      handleNewChat()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } flex-shrink-0 overflow-hidden border-r border-zinc-200/80 bg-white transition-all dark:border-zinc-800/80 dark:bg-zinc-950`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <button
              onClick={handleNewChat}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 ${
                  conversationId === conv.id
                    ? 'bg-zinc-200 dark:bg-zinc-800'
                    : ''
                }`}
              >
                <span className="truncate">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="ml-2 hidden shrink-0 rounded p-0.5 text-zinc-400 hover:text-red-500 group-hover:block"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="px-3 py-4 text-xs text-zinc-400">
                No conversations yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-950">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-sm font-medium">
            {conversations.find((c) => c.id === conversationId)?.title ??
              'New chat'}
          </h1>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center pt-32 text-center">
                <div>
                  <p className="text-lg font-medium text-zinc-400">
                    Start a conversation
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Send a message to begin chatting with Claude.
                  </p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-400 dark:bg-zinc-800">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage indicator + Input */}
        <div className="border-t border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-950">
          {isFree && (
            <div className="mx-auto mb-2 flex max-w-2xl items-center justify-between text-xs text-zinc-400">
              <span>
                {messageCount} / {messageLimit} messages this month
              </span>
              {!atLimit && !limitReached && (
                <a
                  href="/dashboard/billing"
                  className="text-blue-500 hover:underline"
                >
                  Upgrade
                </a>
              )}
            </div>
          )}
          {atLimit || limitReached ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                You&apos;ve reached your monthly message limit
              </p>
              <a
                href="/dashboard/billing"
                className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Upgrade to Pro for unlimited messages
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-2xl gap-2"
            >
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Send a message..."
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                disabled={isStreaming}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
