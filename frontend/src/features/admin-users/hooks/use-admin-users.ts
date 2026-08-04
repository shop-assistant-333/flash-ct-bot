import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchAdminUsers } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

/** One screenful of the list; the backend counts pages from zero. */
export const USERS_PAGE_SIZE = 20

/**
 * The previous page stays on screen while the next one loads: typing in the
 * search field would otherwise blank the list on every keystroke.
 */
export function useAdminUsers(search: string, page: number) {
  return useQuery({
    queryKey: adminUsersKeys.list(search, page),
    queryFn: ({ signal }) => fetchAdminUsers({ search, page, size: USERS_PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
  })
}
