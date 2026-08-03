import { useQuery } from '@tanstack/react-query'

import { fetchSubjects } from './subjects-api'
import { subjectsKeys } from './subjects-keys'

export function useSubjects() {
  return useQuery({
    queryKey: subjectsKeys.list(),
    queryFn: ({ signal }) => fetchSubjects(signal),
  })
}
