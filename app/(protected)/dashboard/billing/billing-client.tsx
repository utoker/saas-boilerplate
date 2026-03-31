'use client'

import { useState } from 'react'
import { createCheckoutSession, createPortalSession } from '@/app/actions/billing'

export function BillingClient({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  async function handleManage() {
    setLoading(true)
    try {
      const url = await createPortalSession()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  if (isPro) {
    return (
      <button
        onClick={handleManage}
        disabled={loading}
        className="rounded border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {loading ? 'Loading...' : 'Manage Subscription'}
      </button>
    )
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </button>
  )
}
