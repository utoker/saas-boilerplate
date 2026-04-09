export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="h-7 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-4 w-80 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>

      <div className="mt-8">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-3 h-56 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </div>

      <div className="mt-8">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="mt-3 h-48 animate-pulse rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
      </div>
    </div>
  )
}
