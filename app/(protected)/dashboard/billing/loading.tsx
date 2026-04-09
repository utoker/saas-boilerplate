export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="h-7 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />

      <div className="mt-6 h-64 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
      <div className="mt-6 h-40 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
      <div className="mt-6 h-48 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>
    </div>
  )
}
