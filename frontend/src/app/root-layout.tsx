import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { Spinner } from '@/shared/ui/spinner'

/** Wraps every route: shared chrome goes here (navigation, safe-area padding, …). */
export function RootLayout() {
  return (
    <main className="app-shell">
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </main>
  )
}
