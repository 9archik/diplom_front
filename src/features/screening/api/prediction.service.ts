import { apiClient } from '../../../shared/api/base'
import { convertPayloadToUS } from '../lib/unitConverter'
import type {
  CreatePredictionFeedbackRequest,
  CreatePredictionFeedbackResponse,
  CreatePredictionRequest,
  CreatePredictionResponse,
  FieldUnitSystemMap,
  ListPredictionsResponse,
  PredictionDetailsResponse,
  PredictionModel,
  ScreeningPayload,
  UpdatePredictionModeRequest,
} from '../model/types'

function requireNumberField(value: number | null, fieldName: string): number {
  if (value === null) {
    throw new Error(`Отсутствует обязательное поле: ${fieldName}`)
  }

  return value
}

function toPredictionRequest(
  name: string,
  payload: ScreeningPayload,
  model: PredictionModel,
): CreatePredictionRequest {
  return {
    name,
    mode: model,
    weight_kg: payload.weight_kg,
    RIDAGEYR: payload.RIDAGEYR,
    RIAGENDR: payload.RIAGENDR,
    BMXHT: payload.BMXHT,
    BMXWAIST: payload.BMXWAIST,
    hypertension: payload.hypertension,
    LBXGLU: requireNumberField(payload.LBXGLU, 'LBXGLU'),
    LBXTC: requireNumberField(payload.LBXTC, 'LBXTC'),
    LBDHDD: requireNumberField(payload.LBDHDD, 'LBDHDD'),
    LBXTR: payload.LBXTR,
    DMDEDUC2: requireNumberField(payload.DMDEDUC2, 'DMDEDUC2'),
    LBXSCR: requireNumberField(payload.LBXSCR, 'LBXSCR'),
    MCQ300C: requireNumberField(payload.MCQ300C, 'MCQ300C'),
    LBXSAT: payload.LBXSAT,
    LBXSASS: payload.LBXSASS,
    LBXSUA: payload.LBXSUA,
    LBXVIDMS: payload.LBXVIDMS,
    LBXSBU: payload.LBXSBU,
    URXUMA: payload.URXUMA,
    LBXHGB: payload.LBXHGB,
    LBXRBCSI: payload.LBXRBCSI,
    LBXSTB: payload.LBXSTB,
    LBXSAL: payload.LBXSAL,
    LBXSAPSI: payload.LBXSAPSI,
    LBXWBCSI: payload.LBXWBCSI,
    LBXLYPCT: payload.LBXLYPCT,
    LBXMCVSI: payload.LBXMCVSI,
    LBXRDW: payload.LBXRDW,
    LBXCRP: payload.LBXCRP,
    HSD010: payload.HSD010,
    MCQ160A: payload.MCQ160A,
    MCQ160E: payload.MCQ160E,
    MCQ160F: payload.MCQ160F,
  }
}

export const predictionService = {
  async createPrediction(
    name: string,
    payload: ScreeningPayload,
    fieldUnitSystemMap: FieldUnitSystemMap,
    model: PredictionModel,
  ) {
    const normalizedPayload = convertPayloadToUS(payload, fieldUnitSystemMap)
    const requestPayload = toPredictionRequest(name, normalizedPayload, model)
    const { data } = await apiClient.post<CreatePredictionResponse>('/predictions/', requestPayload)
    return data
  },

  async listPredictions(skip = 0, limit = 20) {
    const { data } = await apiClient.get<ListPredictionsResponse>('/predictions/', {
      params: { skip, limit },
    })
    return data
  },

  async getPredictionById(id: string) {
    const { data } = await apiClient.get<PredictionDetailsResponse>(`/predictions/${id}`)
    return data
  },

  async sendPredictionFeedback(id: string, payload: CreatePredictionFeedbackRequest) {
    const { data } = await apiClient.post<CreatePredictionFeedbackResponse>(
      `/predictions/${id}/feedback`,
      payload,
    )
    return data
  },

  async updatePredictionMode(id: string, payload: UpdatePredictionModeRequest) {
    const { data } = await apiClient.patch<PredictionDetailsResponse>(`/predictions/${id}/mode`, payload)
    return data
  },
}
