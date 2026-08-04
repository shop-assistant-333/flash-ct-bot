import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSubject } from '../api/admin-subjects-api'
import { adminSubjectsKeys } from '../api/admin-subjects-keys'

export function useDeleteSubject(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteSubject(subjectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
