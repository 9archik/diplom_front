import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { predictionService } from '../api/prediction.service'
import type { CreatePredictionFeedbackRequest } from '../model/types'

interface CreatePredictionFeedbackParams {
  predictionId: string
  payload: CreatePredictionFeedbackRequest
}

function getFeedbackErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Не удалось отправить отзыв'
  }

  const status = error.response?.status

  if (status === 422) {
    return 'Выберите реальный класс'
  }

  if (status === 401 || status === 403) {
    return 'Требуется авторизация для отправки отзыва'
  }

  if (status === 404) {
    return 'Предсказание не найдено'
  }

  return 'Не удалось отправить отзыв'
}

export function useCreatePredictionFeedback() {
  return useMutation({
    mutationFn: ({ predictionId, payload }: CreatePredictionFeedbackParams) =>
      predictionService.sendPredictionFeedback(predictionId, payload),
    onSuccess: () => {
      notifications.show({
        title: 'Успешно',
        message: 'Отзыв отправлен',
        color: 'health.6',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка отправки',
        message: getFeedbackErrorMessage(error),
        color: 'red',
      })
    },
  })
}
