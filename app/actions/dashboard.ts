'use server'

import { verifySession } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export type ActivityEvent = {
  id: string
  type: 'conversation_created' | 'subscription_changed' | 'account_created'
  title: string
  description: string
  timestamp: string
}

export async function getMessagesPerDay(): Promise<{ date: string; count: number }[]> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_messages_per_day', {
    uid: user.id,
    days: 14,
  })

  if (error) {
    return []
  }

  const dataMap = new Map<string, number>(
    (data ?? []).map((d: { date: string; count: number }) => [d.date, Number(d.count)])
  )

  const now = new Date()
  const result: { date: string; count: number }[] = []

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    result.push({ date: dateStr, count: dataMap.get(dateStr) ?? 0 })
  }

  return result
}

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const user = await verifySession()
  const supabase = await createClient()

  const [convResult, subResult, profileResult] = await Promise.all([
    supabase
      .from('conversations')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('subscriptions')
      .select('id, plan, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3),
    supabase
      .from('profiles')
      .select('id, created_at')
      .eq('id', user.id)
      .single(),
  ])

  const events: ActivityEvent[] = []

  for (const conv of convResult.data ?? []) {
    events.push({
      id: `conv-${conv.id}`,
      type: 'conversation_created',
      title: 'Started a conversation',
      description: conv.title || 'Untitled conversation',
      timestamp: conv.created_at,
    })
  }

  for (const sub of subResult.data ?? []) {
    if (sub.updated_at !== sub.created_at) {
      events.push({
        id: `sub-update-${sub.id}`,
        type: 'subscription_changed',
        title: sub.plan === 'pro' ? 'Upgraded to Pro' : 'Subscription updated',
        description: `Plan: ${sub.plan}`,
        timestamp: sub.updated_at,
      })
    }
  }

  if (profileResult.data) {
    events.push({
      id: `profile-${profileResult.data.id}`,
      type: 'account_created',
      title: 'Account created',
      description: 'Welcome to the platform',
      timestamp: profileResult.data.created_at,
    })
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return events.slice(0, 5)
}
