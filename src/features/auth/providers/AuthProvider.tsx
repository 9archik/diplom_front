import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { useProfileQuery, PROFILE_QUERY_KEY } from '../hooks/useProfileQuery'
import { clearTokens, getAccessToken } from '../../../shared/lib/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const hasAccessToken = Boolean(getAccessToken())
  const profileQuery = useProfileQuery(hasAccessToken)

  const shouldResetAuthState =
    hasAccessToken &&
    profileQuery.isError &&
    axios.isAxiosError(profileQuery.error) &&
    [401, 403].includes(profileQuery.error.response?.status ?? 0)

  useEffect(() => {
    if (!shouldResetAuthState) {
      return
    }

    clearTokens()
    queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
  }, [queryClient, shouldResetAuthState])

  const user = shouldResetAuthState ? null : (profileQuery.data ?? null)
  const isAuthenticated = Boolean(user)
  const isAuthLoading = hasAccessToken && profileQuery.isLoading

  const refetchProfile = async () => {
    const result = await profileQuery.refetch()

    if (result.isSuccess) {
      return result.data
    }

    return null
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isAuthLoading,
    refetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
