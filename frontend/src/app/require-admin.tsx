import { Navigate, Outlet } from 'react-router'

import { ADMIN_ROUTES } from '@/app/routes'
import { useProfile } from '@/features/profile'
import { Spinner } from '@/shared/ui/spinner'

/**
 * Second gate inside the admin branch, for the screens a teacher must not see
 * at all — creating a user, and whatever joins it later. Hiding the button is
 * not enough: a typed URL has to bounce too.
 *
 * The profile is already in the cache by the time this mounts, since
 * `RequireRole` above waited for it; the spinner is there for a refetch.
 */
export function RequireAdmin() {
  const profileQuery = useProfile()

  if (profileQuery.isPending) {
    return <Spinner />
  }

  if (profileQuery.isError || profileQuery.data.role !== 'ADMIN') {
    return <Navigate to={ADMIN_ROUTES.users} replace />
  }

  return <Outlet />
}
