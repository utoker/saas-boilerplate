'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from '@/app/actions/auth'

function validatePassword(password: string): string {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return ''
}

function validateConfirm(password: string, confirm: string): string {
  if (!confirm) return 'Please confirm your password.'
  if (password !== confirm) return 'Passwords do not match.'
  return ''
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const errors: Record<string, string> = {
      password: validatePassword(password),
      confirmPassword: validateConfirm(password, confirmPassword),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Set new password
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your new password below.
        </p>
      </div>

      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        {state?.error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            onBlur={(e) => {
              const error = validatePassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, password: error }))
            }}
            className={`mt-1 block w-full rounded border px-3 py-2 text-sm focus:outline-none dark:bg-zinc-800 ${
              fieldErrors.password
                ? 'border-red-400 focus:border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-zinc-500 dark:border-zinc-700'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            onBlur={(e) => {
              const form = e.target.closest('form')
              const password = new FormData(form!).get('password') as string
              const error = validateConfirm(password, e.target.value)
              setFieldErrors((prev) => ({ ...prev, confirmPassword: error }))
            }}
            className={`mt-1 block w-full rounded border px-3 py-2 text-sm focus:outline-none dark:bg-zinc-800 ${
              fieldErrors.confirmPassword
                ? 'border-red-400 focus:border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-zinc-500 dark:border-zinc-700'
            }`}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
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
          {pending ? 'Updating...' : 'Update password'}
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
