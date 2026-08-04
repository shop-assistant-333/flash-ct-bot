import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createUser, type UserRequest } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

/**
 * A new user shifts every page of the list, so the whole feature is dropped.
 * `all` is a prefix of both `list` and `detail`, hence one call is enough here
 * and in the other admin-user mutations.
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UserRequest) => createUser(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
