import { useQuery } from '@tanstack/react-query'

import { predictionService } from '../api/prediction.service'

export function usePredictionDetailsQuery(id: string) {
  return useQuery({
    queryKey: ['prediction-details', id],
    queryFn: () => predictionService.getPredictionById(id),
    enabled: Boolean(id),
    retry: false,
  })
}
