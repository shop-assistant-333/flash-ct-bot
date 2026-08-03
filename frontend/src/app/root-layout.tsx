import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { BottomNav } from '@/app/bottom-nav'
import { Spinner } from '@/shared/ui/spinner'

/**
 * Wraps every route: shared chrome goes here (navigation, safe-area padding, …).
 *
 * `pb-nav-safe` reserves the space the fixed tab bar covers, so no screen has to
 * know about it. Layout rules: ../../style-guide.md
 */
export function RootLayout() {
  return (
    <>
      <main className="mx-auto w-full max-w-app pt-safe px-gutter pb-nav-safe">
        <div className="py-4">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
