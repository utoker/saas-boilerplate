import Link from 'next/link'
import { getUser, getProfile, getSubscription } from '@/lib/dal'
import { getMonthlyMessageCount } from '@/app/actions/billing'
import { getMessagesPerDay, getRecentActivity } from '@/app/actions/dashboard'
import { MESSAGE_LIMIT } from '@/lib/constants'
import { UsageChart } from './_components/usage-chart'
import { ActivityFeed } from './_components/activity-feed'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const [user, profile, subscription, messageCount, messagesPerDay, recentActivity] = await Promise.all([
    getUser(),
    getProfile(),
    getSubscription(),
    getMonthlyMessageCount(),
    getMessagesPerDay(),
    getRecentActivity(),
  ])

  const plan = subscription?.plan ?? 'free'
  const isPro = plan === 'pro'
  const usagePercent = Math.min((messageCount / MESSAGE_LIMIT) * 100, 100)

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile?.display_name || user?.email?.split('@')[0]}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Here&apos;s an overview of your account and usage.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Plan card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/50">
              <svg className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Current Plan</p>
          </div>
          <p className="mt-4 text-2xl font-semibold">{isPro ? 'Pro' : 'Free'}</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {isPro ? 'Unlimited messages' : `${MESSAGE_LIMIT} messages/month`}
          </p>
        </div>

        {/* Messages card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <svg className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Messages This Month</p>
          </div>
          <p className="mt-4 text-2xl font-semibold">{messageCount}</p>
          {!isPro ? (
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    messageCount >= MESSAGE_LIMIT ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                {messageCount} / {MESSAGE_LIMIT} used
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Unlimited</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            href="/chat"
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/50 dark:group-hover:bg-blue-950">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Start a Chat</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Chat with Claude AI</p>
            </div>
          </Link>

          <Link
            href="/dashboard/billing"
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-900 dark:hover:bg-violet-950/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 transition-colors group-hover:bg-violet-100 dark:bg-violet-950/50 dark:group-hover:bg-violet-950">
              <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{isPro ? 'Manage Billing' : 'Upgrade to Pro'}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {isPro ? 'View your subscription' : 'Get unlimited messages'}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Usage Overview</h2>
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">Messages sent per day (last 14 days)</p>
          <UsageChart data={messagesPerDay} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Recent Activity</h2>
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ActivityFeed events={recentActivity} />
        </div>
      </div>
    </div>
  )
}
