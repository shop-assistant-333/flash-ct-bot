import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unassignTeacherSubject } from '../api/admin-users-api'
import { adminUsersKeys } from '../api/admin-users-keys'

export function useUnassignTeacherSubject(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectId: number) => unassignTeacherSubject(userId, subjectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}
