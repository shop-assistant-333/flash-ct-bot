import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSubject, type SubjectRequest } from '../api/admin-subjects-api'
import { adminSubjectsKeys } from '../api/admin-subjects-keys'

export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubjectRequest) => createSubject(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
    },
  })
}
