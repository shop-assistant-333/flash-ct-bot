import { useQuery } from '@tanstack/react-query'

import { fetchProfile } from '../api/profile-api'
import { profileKeys } from '../api/profile-keys'

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: ({ signal }) => fetchProfile(signal),
  })
}
