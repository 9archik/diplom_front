import { apiClient } from '../../../shared/api/base'
import type { LoginRequest, LoginResponse, Profile, RegisterRequest } from '../model/types'

const AUTH_PREFIX = '/auth'

export const authService = {
  async register(payload: RegisterRequest) {
    await apiClient.post(`${AUTH_PREFIX}/register`, payload)
  },

  async login(payload: LoginRequest) {
    const { data } = await apiClient.post<LoginResponse>(`${AUTH_PREFIX}/login`, payload)
    return data
  },

  async getProfile() {
    const { data } = await apiClient.get<Profile>('/profile')
    return data
  },
}
