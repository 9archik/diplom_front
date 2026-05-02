import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import type { LoginResponse } from '../../features/auth/model/types'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../lib/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const AUTH_REFRESH_PATH = '/auth/refresh'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  __isRetryAfterRefresh?: boolean
}

let refreshPromise: Promise<string> | null = null

function isAuthEndpointRequest(url?: string) {
  if (!url) {
    return false
  }

  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes(AUTH_REFRESH_PATH)
}

function isAuthRefreshRequest(url?: string) {
  if (!url) {
    return false
  }

  return url.includes(AUTH_REFRESH_PATH)
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token')
  }

  const { data } = await refreshClient.post<LoginResponse>(AUTH_REFRESH_PATH, { refresh_token: refreshToken })
  setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (isAuthEndpointRequest(originalRequest.url) && !isAuthRefreshRequest(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (originalRequest.__isRetryAfterRefresh) {
      return Promise.reject(error)
    }

    if (isAuthRefreshRequest(originalRequest.url)) {
      clearTokens()
      return Promise.reject(error)
    }

    if (!getRefreshToken()) {
      clearTokens()
      return Promise.reject(error)
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
      }

      const newAccessToken = await refreshPromise
      originalRequest.__isRetryAfterRefresh = true
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearTokens()
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }
  },
)
