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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [inputEmpty, setInputEmpty] = useState(true)
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
    setInputEmpty(true)
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
    if (deletingId !== id) {
      setDeletingId(id)
      return
    }
    setDeletingId(null)
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
                onClick={() => {
                  setDeletingId(null)
                  handleSelectConversation(conv.id)
                }}
                className={`group flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 ${
                  conversationId === conv.id
                    ? 'bg-zinc-200 dark:bg-zinc-800'
                    : ''
                }`}
              >
                <span className="truncate">{conv.title}</span>
                {deletingId === conv.id ? (
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    Delete?
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="ml-2 hidden shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-red-500 group-hover:block"
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
                        strokeWidth={1.5}
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                )}
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
              <div className="flex h-full flex-col items-center justify-center pt-24 text-center">
                <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                  How can I help you today?
                </h2>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  Start a conversation or try one of these:
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {[
                    'Explain how React Server Components work',
                    'Help me write a SQL query to find duplicate records',
                    'What are some best practices for API design?',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = prompt
                          setInputEmpty(false)
                        }
                        handleSubmit({})
                      }}
                      className="rounded-xl border border-zinc-300 px-4 py-3 text-left text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
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
                onChange={(e) => setInputEmpty(!e.target.value.trim())}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isStreaming || inputEmpty}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
