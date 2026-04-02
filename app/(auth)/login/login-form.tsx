'use client'

import { useActionState, useState } from 'react'
import { signIn, signInWithGoogle } from '@/app/actions/auth'

function validateEmail(email: string): string {
  if (!email) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
  return ''
}

function validatePassword(password: string): string {
  if (!password) return 'Password is required.'
  return ''
}

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleBlur(field: string, value: string) {
    const error =
      field === 'email' ? validateEmail(value) : validatePassword(value)
    setFieldErrors((prev) => ({ ...prev, [field]: error }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const formData = new FormData(form)
    const errors: Record<string, string> = {
      email: validateEmail(formData.get('email') as string),
      password: validatePassword(formData.get('password') as string),
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your credentials to continue.
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
            onBlur={(e) => handleBlur('email', e.target.value)}
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            onBlur={(e) => handleBlur('password', e.target.value)}
            className={`mt-1 block w-full rounded border px-3 py-2 text-sm focus:outline-none dark:bg-zinc-800 ${
              fieldErrors.password
                ? 'border-red-400 focus:border-red-500 dark:border-red-500'
                : 'border-zinc-300 focus:border-zinc-500 dark:border-zinc-700'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
          <div className="mt-1.5 flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Forgot password?
            </a>
          </div>
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
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-300 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">
            Or
          </span>
        </div>
      </div>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full rounded border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        No account?{' '}
        <a
          href="/signup"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          Sign up
        </a>
      </p>
    </div>
  )
}
