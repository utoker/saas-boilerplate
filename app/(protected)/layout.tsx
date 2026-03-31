import { verifySession } from '@/lib/dal'
import { SidebarNav } from './sidebar-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifySession()

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <SidebarNav userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-900/30">{children}</main>
    </div>
  )
}
