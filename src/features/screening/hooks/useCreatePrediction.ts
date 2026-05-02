import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

import { predictionService } from '../api/prediction.service'
import type { FieldUnitSystemMap, PredictionModel, ScreeningPayload } from '../model/types'

function stringifyErrorPayload(data: unknown): string | null {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data
  }

  if (data && typeof data === 'object') {
    const detail = Reflect.get(data, 'detail')
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail
    }

    const message = Reflect.get(data, 'message')
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }

    try {
      return JSON.stringify(data)
    } catch {
      return null
    }
  }

  return null
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payloadMessage = stringifyErrorPayload(error.response?.data)

    if (payloadMessage) {
      return status ? `Ошибка ${status}: ${payloadMessage}` : payloadMessage
    }

    if (error.message) {
      return status ? `Ошибка ${status}: ${error.message}` : error.message
    }

    return status ? `Ошибка ${status}: Не удалось отправить данные для прогноза` : 'Не удалось отправить данные для прогноза'
  }

  return 'Не удалось отправить данные для прогноза'
}

interface CreatePredictionParams {
  name: string
  payload: ScreeningPayload
  fieldUnitSystemMap: FieldUnitSystemMap
  model: PredictionModel
}

export function useCreatePrediction() {
  return useMutation({
    mutationFn: ({ name, payload, fieldUnitSystemMap, model }: CreatePredictionParams) =>
      predictionService.createPrediction(name, payload, fieldUnitSystemMap, model),
    onSuccess: () => {
      notifications.show({
        title: 'Успешно',
        message: 'Данные отправлены. Прогноз получен.',
        color: 'health.6',
      })
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка запроса',
        message: getErrorMessage(error),
        color: 'red',
      })
    },
  })
}
