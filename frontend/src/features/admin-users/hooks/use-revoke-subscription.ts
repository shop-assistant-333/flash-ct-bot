import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revokeSubscription } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

export function useRevokeSubscription(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectId: number) => revokeSubscription(userId, subjectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
