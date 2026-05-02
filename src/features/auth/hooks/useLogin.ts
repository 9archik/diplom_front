import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'

import { authService } from '../api/auth.service'
import type { LoginRequest, LoginResponse } from '../model/types'
import { getAxiosFastApiMessage } from '../../../shared/api/axiosFastApiDetail'
import { setTokens } from '../../../shared/lib/auth'

const FALLBACK_LOGIN = 'Не удалось выполнить вход'

function storeTokens(data: LoginResponse) {
  setTokens(data.access_token, data.refresh_token)
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    throwOnError: false,
    onSuccess: (data) => {
      storeTokens(data)
      notifications.show({
        title: 'Успешный вход',
        message: 'Токены авторизации сохранены.',
        color: 'health.6',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка входа',
        message: getAxiosFastApiMessage(error, FALLBACK_LOGIN),
        color: 'red',
      })
    },
  })
}
