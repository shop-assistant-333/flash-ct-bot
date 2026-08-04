import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateSubject, type SubjectRequest } from '../api/admin-subjects-api'
import { adminSubjectsKeys } from '../api/admin-subjects-keys'

export function useUpdateSubject(subjectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubjectRequest) => updateSubject(subjectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
