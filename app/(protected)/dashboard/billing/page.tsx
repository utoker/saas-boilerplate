import { getSubscription } from '@/lib/dal'
import { getMonthlyMessageCount } from '@/app/actions/billing'
import { MESSAGE_LIMIT } from '@/lib/constants'
import { BillingClient } from './billing-client'

export const metadata = { title: 'Billing' }

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const subscription = await getSubscription()
  const messageCount = await getMonthlyMessageCount()

  const plan = subscription?.plan ?? 'free'
  const isPro = plan === 'pro'

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Manage your subscription and usage.
      </p>

      {params.success === 'true' && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          You have been upgraded to Pro. Enjoy unlimited messages!
        </div>
      )}

      {/* Plan & Usage card */}
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Current Plan section */}
        <div className="p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Current Plan
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold">{isPro ? 'Pro' : 'Free'}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPro
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {isPro ? 'Unlimited messages' : `${MESSAGE_LIMIT} messages/month`}
            </span>
          </div>
          {isPro && subscription?.current_period_end && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Renews on{' '}
              {new Date(subscription.current_period_end).toLocaleDateString(
                'en-US',
                { month: 'long', day: 'numeric', year: 'numeric' }
              )}
            </p>
          )}
        </div>

        {/* Usage section (free only) */}
        {!isPro && (
          <div className="border-t border-zinc-100 p-6 dark:border-zinc-800/50">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Usage This Month
            </h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {messageCount} / {MESSAGE_LIMIT} messages
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">
                  {Math.round((messageCount / MESSAGE_LIMIT) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    messageCount >= MESSAGE_LIMIT ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min((messageCount / MESSAGE_LIMIT) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions section */}
        <div className="border-t border-zinc-100 p-6 dark:border-zinc-800/50">
          <BillingClient isPro={isPro} />
        </div>
      </div>
    </div>
  )
}
