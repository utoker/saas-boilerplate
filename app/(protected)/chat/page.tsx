import { verifySession, getSubscription } from '@/lib/dal'
import { getConversations, getMessages } from '@/app/actions/chat'
import { getMonthlyMessageCount } from '@/app/actions/billing'
import { MESSAGE_LIMIT } from '@/lib/constants'
import { ChatInterface } from './chat-interface'

export const metadata = { title: 'Chat' }

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  await verifySession()
  const params = await searchParams
  const [conversations, messages, subscription, messageCount] = await Promise.all([
    getConversations(),
    params.conversation ? getMessages(params.conversation) : Promise.resolve([]),
    getSubscription(),
    getMonthlyMessageCount(),
  ])

  const plan = subscription?.plan ?? 'free'

  return (
    <ChatInterface
      key={params.conversation ?? 'new'}
      conversations={conversations}
      initialMessages={messages}
      activeConversationId={params.conversation ?? null}
      plan={plan}
      messageCount={messageCount}
      messageLimit={MESSAGE_LIMIT}
    />
  )
}
