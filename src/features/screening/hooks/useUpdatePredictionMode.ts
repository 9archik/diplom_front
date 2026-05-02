import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { predictionService } from '../api/prediction.service'
import type { PredictionModel } from '../model/types'

interface UpdatePredictionModeParams {
  predictionId: string
  mode: PredictionModel
}

function extractDetailMessage(data: unknown): string | null {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return null
  }

  const detail = Reflect.get(data, 'detail')
  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail
  }

  const message = Reflect.get(data, 'message')
  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  return null
}

function getModeUpdateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Не удалось сменить режим'
  }

  const status = error.response?.status

  if (status === 404) {
    return 'Предсказание не найдено'
  }

  if (status === 422) {
    return extractDetailMessage(error.response?.data) ?? 'Недостаточно исходных данных для пересчета'
  }

  if (status === 503) {
    return 'Модель временно недоступна'
  }

  return 'Не удалось сменить режим'
}

export function useUpdatePredictionMode() {
  return useMutation({
    mutationFn: ({ predictionId, mode }: UpdatePredictionModeParams) =>
      predictionService.updatePredictionMode(predictionId, { mode }),
    onSuccess: () => {
      notifications.show({
        title: 'Успешно',
        message: 'Режим предсказания обновлен',
        color: 'health.6',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка режима',
        message: getModeUpdateErrorMessage(error),
        color: 'red',
      })
    },
  })
}
