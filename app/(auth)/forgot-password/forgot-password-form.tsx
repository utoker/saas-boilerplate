'use client'

import { useActionState, useState } from 'react'
import { resetPassword } from '@/app/actions/auth'

function validateEmail(email: string): string {
  if (!email) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const errors: Record<string, string> = {
      email: validateEmail(formData.get('email') as string),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) {
      e.preventDefault()
    }
  }

  if (state?.message) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-zinc-500">{state.message}</p>
        <a
          href="/login"
          className="block text-center text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Back to login
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        {state?.error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            onBlur={(e) => {
              const error = validateEmail(e.target.value)
              setFieldErrors((prev) => ({ ...prev, email: error }))
            }}
            className={`mt-1 block w-full rounded border px-3 py-2 text-sm focus:outline-none dark:bg-zinc-800 ${
              fieldErrors.email
                ? 'border-red-400 focus:border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-zinc-500 dark:border-zinc-700'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>
        <button
          disabled={pending}
          type="submit"
          className="flex w-full items-center justify-center rounded bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending && (
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {pending ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        <a
          href="/login"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Back to login
        </a>
      </p>
    </div>
  )
}
