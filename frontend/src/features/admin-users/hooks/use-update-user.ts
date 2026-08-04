import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateUser, type UserRequest } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

/** Name, username and role are shown in the list too, so it goes stale as well. */
export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UserRequest) => updateUser(userId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
