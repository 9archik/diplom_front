import { useQuery } from '@tanstack/react-query'

import { authService } from '../api/auth.service'

export const PROFILE_QUERY_KEY = ['auth', 'profile']

export function useProfileQuery(enabled: boolean) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    enabled,
    retry: false,
  })
}
