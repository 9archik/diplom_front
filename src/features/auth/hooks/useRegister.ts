import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'

import { authService } from '../api/auth.service'
import type { RegisterRequest } from '../model/types'
import { getAxiosFastApiMessage } from '../../../shared/api/axiosFastApiDetail'

const FALLBACK_REGISTER = 'Не удалось выполнить регистрацию'

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
    throwOnError: false,
    onSuccess: () => {
      notifications.show({
        title: 'Успешно',
        message: 'Регистрация завершена. Теперь можно войти в систему.',
        color: 'health.6',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка регистрации',
        message: getAxiosFastApiMessage(error, FALLBACK_REGISTER),
        color: 'red',
      })
    },
  })
}
