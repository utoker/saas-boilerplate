import { Suspense } from 'react'
import { getSubscription } from '@/lib/dal'
import {
  getMonthlyMessageCount,
  getBillingPeriodUsage,
  getInvoices,
} from '@/app/actions/billing'
import { MESSAGE_LIMIT } from '@/lib/constants'
import { BillingClient } from './billing-client'

export const metadata = { title: 'Billing' }

const freePlanFeatures = [
  '100 AI messages per month',
  'Email authentication',
  'Basic dashboard',
  'Community support',
]

const proPlanFeatures = [
  'Unlimited AI messages',
  'Google OAuth',
  'Priority support',
  'Full API access',
  'Advanced analytics',
]

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="shrink-0 text-blue-600 dark:text-blue-400"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SectionSkeleton({ className = 'h-40' }: { className?: string }) {
  return (
    <div
      className={`${className} animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}
    />
  )
}

async function BillingPeriodSection() {
  const billingUsage = await getBillingPeriodUsage()
  const periodStartFormatted = new Date(billingUsage.periodStart).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric' }
  )
  const periodEndFormatted = new Date(billingUsage.periodEnd).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  )
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Usage This Billing Period
        </h2>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {periodStartFormatted} &ndash; {periodEndFormatted}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-2xl font-semibold">{billingUsage.messageCount}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              AI messages sent
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-2xl font-semibold">{billingUsage.conversationCount}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Conversations created
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

async function InvoiceHistorySection({
  hasCustomer,
}: {
  hasCustomer: boolean
}) {
  const invoices = await getInvoices()

  if (invoices.length > 0) {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Invoice History
          </h2>
          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {new Date(invoice.date * 1000).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    ${(invoice.amount / 100).toFixed(2)}{' '}
                    {invoice.currency.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}
                  >
                    {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                  {invoice.pdfUrl && (
                    <a
                      href={invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (hasCustomer) {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Invoice History
          </h2>
          <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500">
            No invoices yet. Your first invoice will appear here after your next billing cycle.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const [params, subscription, messageCount] = await Promise.all([
    searchParams,
    getSubscription(),
    getMonthlyMessageCount(),
  ])

  const plan = subscription?.plan ?? 'free'
  const isPro = plan === 'pro'

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
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

      {/* Usage This Billing Period */}
      <Suspense fallback={<SectionSkeleton className="mt-6 h-40" />}>
        <BillingPeriodSection />
      </Suspense>

      {/* Invoice History (Stripe — slowest fetch, isolated so the rest paints first) */}
      <Suspense fallback={<SectionSkeleton className="mt-6 h-48" />}>
        <InvoiceHistorySection hasCustomer={!!subscription?.stripe_customer_id} />
      </Suspense>

      {/* Plan Comparison */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Compare Plans
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* Free Plan */}
          <div
            className={`rounded-xl border p-5 ${
              !isPro
                ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20'
                : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Free</h3>
              {!isPro && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Current plan
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold">
              $0
              <span className="text-sm font-normal text-zinc-400">/month</span>
            </p>
            <ul className="mt-4 space-y-2.5">
              {freePlanFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div
            className={`rounded-xl border p-5 ${
              isPro
                ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20'
                : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Pro</h3>
              {isPro && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Current plan
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold">
              $9
              <span className="text-sm font-normal text-zinc-400">/month</span>
            </p>
            <ul className="mt-4 space-y-2.5">
              {proPlanFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
