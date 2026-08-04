import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteUser } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

export function useDeleteUser(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
