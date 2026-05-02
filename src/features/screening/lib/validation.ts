import { convertNumberValue, isConvertibleField } from './unitConverter'
import type { FieldUnitSystemMap, ScreeningFormValues, ScreeningPayload } from '../model/types'

type ValidatorResult = string | null
type ValidatorFn = (value: ScreeningFormValues[keyof ScreeningFormValues]) => ValidatorResult
type ValidationErrors = Partial<Record<keyof ScreeningFormValues, ValidatorResult>>

function isEmpty(value: unknown): value is '' | null | undefined {
  return value === '' || value === null || value === undefined
}

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value)
}

function validateRequiredNumber(
  value: number | string | null | undefined,
  integer = false,
): ValidatorResult {
  if (isEmpty(value)) {
    return 'Поле обязательно'
  }

  const parsed = toNumber(value)

  if (Number.isNaN(parsed)) {
    return 'Введите корректное число'
  }

  if (integer && !Number.isInteger(parsed)) {
    return 'Введите целое число'
  }

  return null
}

function validateRequiredPositive(value: number | string | null | undefined): ValidatorResult {
  if (isEmpty(value)) {
    return 'Поле обязательно'
  }

  const parsed = toNumber(value)

  if (Number.isNaN(parsed)) {
    return 'Введите корректное число'
  }

  if (parsed <= 0) {
    return 'Значение должно быть больше 0'
  }

  return null
}

function validateRequiredText(value: string | null | undefined): ValidatorResult {
  if (isEmpty(value) || value.trim().length === 0) {
    return 'Поле обязательно'
  }

  return null
}

function validateOptionalNumber(
  value: number | string | null | undefined,
  integer = false,
): ValidatorResult {
  if (isEmpty(value)) {
    return null
  }

  return validateRequiredNumber(value, integer)
}

function validateRequiredAllowed(
  value: number | string | null | undefined,
  allowedValues: number[],
): ValidatorResult {
  if (isEmpty(value)) {
    return 'Поле обязательно'
  }

  const parsed = toNumber(value)

  if (!allowedValues.includes(parsed)) {
    return `Допустимые значения: ${allowedValues.join(', ')}`
  }

  return null
}

function validateOptionalAllowed(
  value: number | string | null | undefined,
  allowedValues: number[],
): ValidatorResult {
  if (isEmpty(value)) {
    return null
  }

  return validateRequiredAllowed(value, allowedValues)
}

export const screeningValidators: Record<keyof ScreeningFormValues, ValidatorFn> = {
  name: (value) => validateRequiredText(typeof value === 'string' ? value : ''),
  RIDAGEYR: (value) => validateRequiredNumber(value, true),
  RIAGENDR: (value) => validateRequiredAllowed(value, [0, 1]),
  BMXHT: (value) => validateRequiredNumber(value),
  weight_kg: (value) => validateRequiredPositive(value),
  BMXWAIST: (value) => validateRequiredNumber(value),
  hypertension: (value) => validateRequiredAllowed(value, [0, 1]),
  HSD010: (value) => validateOptionalNumber(value, true),
  LBXGLU: (value) => validateRequiredNumber(value),
  LBXTC: (value) => validateRequiredNumber(value),
  LBDHDD: (value) => validateRequiredNumber(value),
  LBXTR: (value) => validateOptionalNumber(value),
  LBXSAT: (value) => validateOptionalNumber(value),
  LBXSASS: (value) => validateOptionalNumber(value),
  LBXSUA: (value) => validateOptionalNumber(value),
  LBXSCR: (value) => validateRequiredNumber(value),
  LBXSBU: (value) => validateOptionalNumber(value),
  LBXSAL: (value) => validateOptionalNumber(value),
  LBXSAPSI: (value) => validateOptionalNumber(value),
  LBXSTB: (value) => validateOptionalNumber(value),
  LBXCRP: (value) => validateOptionalNumber(value),
  LBXVIDMS: (value) => validateOptionalNumber(value),
  LBXHGB: (value) => validateOptionalNumber(value),
  LBXRBCSI: (value) => validateOptionalNumber(value),
  LBXWBCSI: (value) => validateOptionalNumber(value),
  LBXLYPCT: (value) => validateOptionalNumber(value),
  LBXMCVSI: (value) => validateOptionalNumber(value),
  LBXRDW: (value) => validateOptionalNumber(value),
  URXUMA: (value) => validateOptionalNumber(value),
  MCQ300C: (value) => validateRequiredAllowed(value, [-1, 0, 1]),
  MCQ160A: (value) => validateOptionalAllowed(value, [0, 1]),
  MCQ160E: (value) => validateOptionalAllowed(value, [0, 1]),
  MCQ160F: (value) => validateOptionalAllowed(value, [0, 1]),
  DMDEDUC2: (value) => validateRequiredNumber(value, true),
}

function normalizeValueForValidation(
  field: keyof ScreeningFormValues,
  value: ScreeningFormValues[keyof ScreeningFormValues],
  fieldUnitSystemMap: FieldUnitSystemMap,
): ScreeningFormValues[keyof ScreeningFormValues] {
  if (!isConvertibleField(field) || fieldUnitSystemMap[field] === 'US' || value === '') {
    return value
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
  return convertNumberValue(field, numericValue, 'SI', 'US')
}

export function validateFieldValue(
  field: keyof ScreeningFormValues,
  value: ScreeningFormValues[keyof ScreeningFormValues],
  fieldUnitSystemMap: FieldUnitSystemMap,
): ValidatorResult {
  const normalizedValue = normalizeValueForValidation(field, value, fieldUnitSystemMap)
  return screeningValidators[field](normalizedValue)
}

export function validateScreeningValues(
  values: ScreeningFormValues,
  fieldUnitSystemMap: FieldUnitSystemMap,
): ValidationErrors {
  const errors: ValidationErrors = {}

  ;(Object.keys(screeningValidators) as Array<keyof ScreeningFormValues>).forEach((field) => {
    const error = validateFieldValue(field, values[field], fieldUnitSystemMap)

    if (error) {
      errors[field] = error
    }
  })

  return errors
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (isEmpty(value)) {
    return null
  }

  return toNumber(value)
}

export function buildScreeningPayload(values: ScreeningFormValues): ScreeningPayload {
  return {
    weight_kg: Number(values.weight_kg),
    RIDAGEYR: Number(values.RIDAGEYR),
    RIAGENDR: Number(values.RIAGENDR),
    BMXHT: Number(values.BMXHT),
    BMXWAIST: Number(values.BMXWAIST),
    hypertension: Number(values.hypertension),
    HSD010: toNullableNumber(values.HSD010),
    LBXGLU: toNullableNumber(values.LBXGLU),
    LBXTC: toNullableNumber(values.LBXTC),
    LBDHDD: toNullableNumber(values.LBDHDD),
    LBXTR: toNullableNumber(values.LBXTR),
    LBXSAT: toNullableNumber(values.LBXSAT),
    LBXSASS: toNullableNumber(values.LBXSASS),
    LBXSUA: toNullableNumber(values.LBXSUA),
    LBXSCR: toNullableNumber(values.LBXSCR),
    LBXSBU: toNullableNumber(values.LBXSBU),
    LBXSAL: toNullableNumber(values.LBXSAL),
    LBXSAPSI: toNullableNumber(values.LBXSAPSI),
    LBXSTB: toNullableNumber(values.LBXSTB),
    LBXCRP: toNullableNumber(values.LBXCRP),
    LBXVIDMS: toNullableNumber(values.LBXVIDMS),
    LBXHGB: toNullableNumber(values.LBXHGB),
    LBXRBCSI: toNullableNumber(values.LBXRBCSI),
    LBXWBCSI: toNullableNumber(values.LBXWBCSI),
    LBXLYPCT: toNullableNumber(values.LBXLYPCT),
    LBXMCVSI: toNullableNumber(values.LBXMCVSI),
    LBXRDW: toNullableNumber(values.LBXRDW),
    URXUMA: toNullableNumber(values.URXUMA),
    MCQ300C: toNullableNumber(values.MCQ300C),
    MCQ160A: toNullableNumber(values.MCQ160A),
    MCQ160E: toNullableNumber(values.MCQ160E),
    MCQ160F: toNullableNumber(values.MCQ160F),
    DMDEDUC2: toNullableNumber(values.DMDEDUC2),
  }
}

export function areStep2CoreFieldsEmpty(values: ScreeningFormValues): boolean {
  return isEmpty(values.LBXGLU) && isEmpty(values.LBDHDD)
}
