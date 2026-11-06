import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'

import { BottomNav } from '@/app/bottom-nav'
import { useSessionTracking } from '@/features/session'
import { Spinner } from '@/shared/ui/spinner'

/**
 * Wraps every student route: shared chrome goes here (navigation, safe-area
 * padding, …). Mounted behind `RequireRole role="USER"`, which is why session
 * tracking can live here — an admin never opens a session. Admin chrome is
 * `admin-layout.tsx`.
 *
 * `<ScrollRestoration />` sits in both layouts (the two branches share no
 * parent route): a new screen opens at the top or at its `#hash`, and
 * back/forward — the browser's or Telegram's — returns to where the user was.
 *
 * `pb-nav-safe` reserves the space the fixed tab bar covers, so no screen has to
 * know about it. Layout rules: ../../style-guide.md
 */
export function RootLayout() {
  const navigation = useNavigation()
  const location = useLocation()
  useSessionTracking()

  // React Router keeps the previous route mounted while the next one's lazy
  // chunk resolves, so a tab tap otherwise sits there with no feedback until
  // it's ready. Swap in the spinner immediately once the target pathname
  // differs — same-route navigations (search params, subject tabs) skip this,
  // those are handled by the feature's own query state.
  const isNavigatingToNewPage =
    navigation.state === 'loading' && navigation.location.pathname !== location.pathname

  return (
    <>
      <ScrollRestoration />
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
      <BottomNav />
    </>
  )
}
