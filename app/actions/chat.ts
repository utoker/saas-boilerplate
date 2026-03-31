'use server'

import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/dal'
import type { Conversation, Message } from '@/lib/types/database'

export async function createConversation(): Promise<string> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error('Failed to create conversation')
  }

  return data.id
}

export async function getConversations(): Promise<Conversation[]> {
  await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error('Failed to load conversations')
  }

  return data ?? []
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Failed to load messages')
  }

  return data ?? []
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await verifySession()
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    throw new Error('Failed to delete conversation')
  }
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  await verifySession()
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) {
    throw new Error('Failed to update conversation title')
  }
}
