import { useQuery } from '@tanstack/react-query'

import { fetchAdminSubjects } from '../api/admin-subjects-api'
import { adminSubjectsKeys } from '../api/admin-subjects-keys'

export function useAdminSubjects() {
  return useQuery({
    queryKey: adminSubjectsKeys.list(),
    queryFn: ({ signal }) => fetchAdminSubjects(signal),
  })
}
