import { streamText, type UIMessage, convertToModelMessages } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'

export async function POST(request: Request) {
  // Auth check -- can't use verifySession() here as it calls redirect()
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const messages: UIMessage[] = body.messages
  const conversationId: string = body.conversation_id

  if (!conversationId || !messages?.length) {
    return Response.json(
      { error: 'conversation_id and messages are required' },
      { status: 400 }
    )
  }

  // Verify conversation belongs to user (RLS enforces this too)
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Check message limit for free users
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (!subscription || subscription.plan === 'free') {
    const { data: count } = await supabase.rpc('count_user_messages_this_month', {
      uid: user.id,
    })

    if ((count ?? 0) >= 100) {
      return Response.json(
        { error: 'Monthly message limit reached. Upgrade to Pro for unlimited messages.' },
        { status: 403 }
      )
    }
  }

  // Save the latest user message to DB
  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role === 'user') {
    const textPart = lastMessage.parts.find((p) => p.type === 'text')
    if (textPart && textPart.type === 'text') {
      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: textPart.text,
      })

      if (insertError) {
        return Response.json(
          { error: 'Failed to save message' },
          { status: 500 }
        )
      }
    }
  }

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    messages: modelMessages,
    onFinish: async ({ text, totalUsage }) => {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: text,
        input_tokens: totalUsage.inputTokens,
        output_tokens: totalUsage.outputTokens,
      })
    },
  })

  return result.toUIMessageStreamResponse()
}
