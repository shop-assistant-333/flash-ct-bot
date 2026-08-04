import { useQuery } from '@tanstack/react-query'

import { fetchAdminUser } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

/** `userId` comes from the URL, so a junk path must not fire a request. */
export function useAdminUser(userId: number) {
  return useQuery({
    queryKey: adminUsersKeys.detail(userId),
    queryFn: ({ signal }) => fetchAdminUser(userId, signal),
    enabled: Number.isInteger(userId),
  })
}
