export type NumericInputValue = number | ''
export type BinaryInputValue = '0' | '1' | ''
export type TernaryInputValue = '-1' | '0' | '1' | ''
export type UnitSystem = 'SI' | 'US'
export type PredictionModel = 'standard' | 'risk_group' | 'aggressive'
export type FeedbackRealClass = 0 | 1 | 2

export interface PredictionModeOption {
  value: PredictionModel
  label: string
  description: string
  metrics: string[]
}

export const PREDICTION_MODE_OPTIONS: PredictionModeOption[] = [
  {
    value: 'standard',
    label: 'Режим 1 - Массовый популяционный скрининг',
    description: 'Базовый сценарий для широкой популяции.',
    metrics: ['Возраст', 'Антропометрия', 'Базовая биохимия'],
  },
  {
    value: 'risk_group',
    label: 'Режим 2 - Скрининг групп риска',
    description: 'Приоритет для пациентов с факторами риска и коморбидностью.',
    metrics: ['Кардиориски', 'Расширенная биохимия', 'Анамнез'],
  },
  {
    value: 'aggressive',
    label: 'Режим 3 - Агрессивный / клинический скрининг',
    description: 'Максимально чувствительный режим клинического скрининга.',
    metrics: ['Полный лабораторный профиль', 'Анамнез', 'Расширенные признаки'],
  },
]

export interface ScreeningFormValues {
  name: string
  RIDAGEYR: NumericInputValue
  RIAGENDR: BinaryInputValue
  BMXHT: NumericInputValue
  weight_kg: NumericInputValue
  BMXWAIST: NumericInputValue
  hypertension: BinaryInputValue
  HSD010: NumericInputValue
  LBXGLU: NumericInputValue
  LBXTC: NumericInputValue
  LBDHDD: NumericInputValue
  LBXTR: NumericInputValue
  LBXSAT: NumericInputValue
  LBXSASS: NumericInputValue
  LBXSUA: NumericInputValue
  LBXSCR: NumericInputValue
  LBXSBU: NumericInputValue
  LBXSAL: NumericInputValue
  LBXSAPSI: NumericInputValue
  LBXSTB: NumericInputValue
  LBXCRP: NumericInputValue
  LBXVIDMS: NumericInputValue
  LBXHGB: NumericInputValue
  LBXRBCSI: NumericInputValue
  LBXWBCSI: NumericInputValue
  LBXLYPCT: NumericInputValue
  LBXMCVSI: NumericInputValue
  LBXRDW: NumericInputValue
  URXUMA: NumericInputValue
  MCQ300C: TernaryInputValue
  MCQ160A: BinaryInputValue
  MCQ160E: BinaryInputValue
  MCQ160F: BinaryInputValue
  DMDEDUC2: NumericInputValue
}

export interface ScreeningPayload {
  weight_kg: number
  RIDAGEYR: number
  RIAGENDR: number
  BMXHT: number
  BMXWAIST: number
  hypertension: number
  HSD010: number | null
  LBXGLU: number | null
  LBXTC: number | null
  LBDHDD: number | null
  LBXTR: number | null
  LBXSAT: number | null
  LBXSASS: number | null
  LBXSUA: number | null
  LBXSCR: number | null
  LBXSBU: number | null
  LBXSAL: number | null
  LBXSAPSI: number | null
  LBXSTB: number | null
  LBXCRP: number | null
  LBXVIDMS: number | null
  LBXHGB: number | null
  LBXRBCSI: number | null
  LBXWBCSI: number | null
  LBXLYPCT: number | null
  LBXMCVSI: number | null
  LBXRDW: number | null
  URXUMA: number | null
  MCQ300C: number | null
  MCQ160A: number | null
  MCQ160E: number | null
  MCQ160F: number | null
  DMDEDUC2: number | null
}

export interface CreatePredictionRequest {
  name: string
  mode: PredictionModel
  weight_kg: number
  RIDAGEYR: number
  RIAGENDR: number
  BMXHT: number
  BMXWAIST: number
  hypertension: number
  LBXGLU: number
  LBXTC: number
  LBDHDD: number
  LBXTR: number | null
  DMDEDUC2: number
  LBXSCR: number
  MCQ300C: number
  LBXSAT: number | null
  LBXSASS: number | null
  LBXSUA: number | null
  LBXVIDMS: number | null
  LBXSBU: number | null
  URXUMA: number | null
  LBXHGB: number | null
  LBXRBCSI: number | null
  LBXSTB: number | null
  LBXSAL: number | null
  LBXSAPSI: number | null
  LBXWBCSI: number | null
  LBXLYPCT: number | null
  LBXMCVSI: number | null
  LBXRDW: number | null
  LBXCRP: number | null
  HSD010: number | null
  MCQ160A: number | null
  MCQ160E: number | null
  MCQ160F: number | null
}

export interface CreatePredictionResponse {
  id?: string
}

export interface CreatePredictionFeedbackRequest {
  real_class: FeedbackRealClass
  comment: string | null
}

export interface CreatePredictionFeedbackResponse {
  success?: boolean
}

export interface UpdatePredictionModeRequest {
  mode: PredictionModel
}

export interface PredictionTopFactor {
  feature: string
  label: string
  value: number
  normal_range: string
  shap_value: number
}

export interface PredictionListItem {
  id: string
  name: string
  mode: PredictionModel
  predicted_class: number
  class_label: string
  probabilities: Record<string, number>
  top_factors: PredictionTopFactor[]
  created_at: string
}

export type ListPredictionsResponse = PredictionListItem[]
export type PredictionInputPayload = Record<string, number | string | boolean | null>

export interface PredictionDetailsResponse extends PredictionListItem {
  has_feedback: boolean
  user_input_data?: PredictionInputPayload
  input_data?: PredictionInputPayload
  input_features?: PredictionInputPayload
  features?: PredictionInputPayload
  computed_data?: PredictionInputPayload
  [key: string]: unknown
}

export const CONVERTIBLE_NUMERIC_FIELDS = [
  'LBXGLU',
  'LBXTC',
  'LBDHDD',
  'LBXTR',
  'LBXSCR',
  'LBXSTB',
  'LBXHGB',
  'LBXSUA',
  'LBXWBCSI',
] as const

export type ConvertibleNumericField = (typeof CONVERTIBLE_NUMERIC_FIELDS)[number]
export type FieldUnitSystemMap = Record<ConvertibleNumericField, UnitSystem>

export const DEFAULT_FIELD_UNIT_SYSTEM_MAP: FieldUnitSystemMap = {
  LBXGLU: 'SI',
  LBXTC: 'SI',
  LBDHDD: 'SI',
  LBXTR: 'SI',
  LBXSCR: 'SI',
  LBXSTB: 'SI',
  LBXHGB: 'SI',
  LBXSUA: 'SI',
  LBXWBCSI: 'SI',
}

export const SCREENING_STEP_FIELDS: Array<Array<keyof ScreeningFormValues>> = [
  ['RIDAGEYR', 'RIAGENDR', 'BMXHT', 'weight_kg', 'BMXWAIST', 'hypertension', 'HSD010'],
  [
    'LBXGLU',
    'LBXTC',
    'LBDHDD',
    'LBXTR',
    'LBXSAT',
    'LBXSASS',
    'LBXSUA',
    'LBXSCR',
    'LBXSBU',
    'LBXSAL',
    'LBXSAPSI',
    'LBXSTB',
    'LBXCRP',
    'LBXVIDMS',
  ],
  ['LBXHGB', 'LBXRBCSI', 'LBXWBCSI', 'LBXLYPCT', 'LBXMCVSI', 'LBXRDW', 'URXUMA'],
  ['name', 'MCQ300C', 'MCQ160A', 'MCQ160E', 'MCQ160F', 'DMDEDUC2'],
]
