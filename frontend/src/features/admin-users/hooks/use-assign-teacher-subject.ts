import { useMutation, useQueryClient } from '@tanstack/react-query'

import { assignTeacherSubject } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

/** Rows of the list carry the teacher badge, so the list is invalidated with the card. */
export function useAssignTeacherSubject(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectId: number) => assignTeacherSubject(userId, subjectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
