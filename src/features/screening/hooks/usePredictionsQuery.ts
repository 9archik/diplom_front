import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { predictionService } from '../api/prediction.service'

export function usePredictionsQuery(skip: number, limit: number) {
  return useQuery({
    queryKey: ['predictions', skip, limit],
    queryFn: () => predictionService.listPredictions(skip, limit),
    placeholderData: keepPreviousData,
  })
}
