import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { LocalDateTime } from '@/shared/api'

import { saveSubscription } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

interface SaveSubscriptionVariables {
  subjectId: number
  paidUntil: LocalDateTime
}

/**
 * Grant and extend are the same call. Rows of the list carry subscription
 * badges, so the list is invalidated together with the card.
 */
export function useSaveSubscription(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectId, paidUntil }: SaveSubscriptionVariables) =>
      saveSubscription(userId, subjectId, { paidUntil }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
