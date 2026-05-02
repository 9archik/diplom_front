import { createContext, useContext } from 'react'

import type { Profile } from '../model/types'

export interface AuthContextValue {
  user: Profile | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  refetchProfile: () => Promise<Profile | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
