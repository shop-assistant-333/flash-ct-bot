import { TriangleAlert } from 'lucide-react'
import { Navigate, Outlet } from 'react-router'

import { ADMIN_ROUTES, ROUTES } from '@/app/routes'
import { useProfile } from '@/features/profile'
import type { UserRole } from '@/shared/api'
import { Spinner } from '@/shared/ui/spinner'
import { StateMessage } from '@/shared/ui/state-message'

interface RequireRoleProps {
  role: UserRole
}

const HOME_OF: Record<UserRole, string> = {
  USER: ROUTES.homework,
  ADMIN: ADMIN_ROUTES.users,
}

/**
 * Pathless layout route in front of a whole branch of the app: the student one
 * and the admin one are disjoint, so the wrong role is sent to the root of its
 * own branch instead of seeing an empty screen.
 *
 * It sits *above* the layout on purpose — neither navigation nor session
 * tracking mounts until the role is known.
 */
export function RequireRole({ role }: RequireRoleProps) {
  const profileQuery = useProfile()

  if (profileQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-app pt-safe px-gutter">
        <Spinner />
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-app pt-safe px-gutter">
        <StateMessage
          icon={TriangleAlert}
          title="Не удалось загрузить профиль"
          description="Проверьте соединение и попробуйте ещё раз"
          action={{ label: 'Повторить', onClick: () => void profileQuery.refetch() }}
        />
      </div>
    )
  }

  if (profileQuery.data.role !== role) {
    return <Navigate to={HOME_OF[profileQuery.data.role]} replace />
  }

  return <Outlet />
}
