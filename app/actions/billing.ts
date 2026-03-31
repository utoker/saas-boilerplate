'use server'

import { verifySession } from '@/lib/dal'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Subscription } from '@/lib/types/database'

// MESSAGE_LIMIT lives in lib/constants.ts (can't export non-functions from 'use server' files)

export async function getSubscription(): Promise<Subscription | null> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function getMonthlyMessageCount(): Promise<number> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('count_user_messages_this_month', {
    uid: user.id,
  })

  if (error) {
    throw new Error('Failed to count messages')
  }

  return data ?? 0
}

export async function createCheckoutSession(): Promise<string> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let stripeCustomerId = subscription?.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })

    stripeCustomerId = customer.id

    await supabaseAdmin
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/billing?canceled=true`,
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  return session.url
}

export async function createPortalSession(): Promise<string> {
  const user = await verifySession()
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No billing account found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/billing`,
  })

  return session.url
}

