import { type ActivityEvent } from '@/app/actions/dashboard'

type Props = {
  events: ActivityEvent[]
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const icons: Record<ActivityEvent['type'], { bg: string; color: string; path: string }> = {
  conversation_created: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    color: 'text-blue-600 dark:text-blue-400',
    path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
  subscription_changed: {
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    color: 'text-violet-600 dark:text-violet-400',
    path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  account_created: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    color: 'text-emerald-600 dark:text-emerald-400',
    path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
}

export function ActivityFeed({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
        No recent activity
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {events.map((event) => {
        const icon = icons[event.type]
        return (
          <div key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${icon.bg}`}>
              <svg className={`h-4 w-4 ${icon.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon.path} />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{event.description}</p>
            </div>
            <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
              {timeAgo(event.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
