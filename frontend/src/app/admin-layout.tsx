import { Suspense } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router'

import { AdminNav } from '@/app/admin-nav'
import { Spinner } from '@/shared/ui/spinner'

/**
 * Shell of the admin branch — same layout rules as `RootLayout`, minus session
 * tracking: a session counts time in the app for student statistics, which the
 * admin has no use for.
 */
export function AdminLayout() {
  const navigation = useNavigation()
  const location = useLocation()

  // Same reason as in `RootLayout`: the previous route stays mounted while the
  // next lazy chunk loads, so a tab tap would otherwise give no feedback.
  const isNavigatingToNewPage =
    navigation.state === 'loading' && navigation.location.pathname !== location.pathname

  return (
    <>
      <main className="mx-auto w-full max-w-app pt-safe px-gutter pb-nav-safe">
        <div className="py-4">
          {isNavigatingToNewPage ? (
            <Spinner />
          ) : (
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
      <AdminNav />
    </>
  )
}
