import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Subscription } from '@/lib/types/database'

export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
})

export const verifySession = cache(async () => {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
})

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await verifySession()
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
})

export const getSubscription = cache(async (): Promise<Subscription | null> => {
  const user = await verifySession()
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return data
})
