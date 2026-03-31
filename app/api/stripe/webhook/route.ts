import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.mode !== 'subscription' || !session.customer || !session.subscription) {
        break
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      const item = subscription.items.data[0]
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscription.id,
          plan: 'pro',
          status: 'active',
          current_period_start: new Date(item.current_period_start * 1000).toISOString(),
          current_period_end: new Date(item.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', session.customer as string)

      if (error) {
        console.error('Failed to update subscription on checkout:', error)
        return Response.json({ error: 'Database update failed' }, { status: 500 })
      }

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const proPriceId = process.env.STRIPE_PRO_PRICE_ID!

      const isProPlan = subscription.items.data.some(
        (item) => item.price.id === proPriceId
      )

      const item = subscription.items.data[0]
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: isProPlan ? 'pro' : 'free',
          status: mapStripeStatus(subscription.status),
          current_period_start: new Date(item.current_period_start * 1000).toISOString(),
          current_period_end: new Date(item.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', subscription.customer as string)

      if (error) {
        console.error('Failed to update subscription:', error)
        return Response.json({ error: 'Database update failed' }, { status: 500 })
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', subscription.customer as string)

      if (error) {
        console.error('Failed to cancel subscription:', error)
        return Response.json({ error: 'Database update failed' }, { status: 500 })
      }

      break
    }
  }

  return Response.json({ received: true })
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'incomplete' {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    default:
      return 'incomplete'
  }
}
