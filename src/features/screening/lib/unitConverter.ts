import {
  CONVERTIBLE_NUMERIC_FIELDS,
  type ConvertibleNumericField,
  type FieldUnitSystemMap,
  type ScreeningFormValues,
  type ScreeningPayload,
  type UnitSystem,
} from '../model/types'

type UnitLabelMap = Record<UnitSystem, string>

const SI_TO_US_FACTORS: Record<ConvertibleNumericField, number> = {
  LBXGLU: 18.01,
  LBXTC: 38.67,
  LBDHDD: 38.67,
  LBXTR: 88.57,
  LBXSCR: 1 / 88.4,
  LBXSTB: 1 / 17.1,
  LBXHGB: 1 / 10,
  LBXSUA: 1 / 59.48,
  LBXWBCSI: 1,
}

const FIELD_UNIT_LABELS: Partial<Record<keyof ScreeningFormValues, UnitLabelMap>> = {
  RIDAGEYR: { SI: 'лет', US: 'лет' },
  BMXHT: { SI: 'см', US: 'см' },
  weight_kg: { SI: 'кг', US: 'кг' },
  BMXWAIST: { SI: 'см', US: 'см' },
  LBXGLU: { SI: 'ммоль/л', US: 'мг/дл' },
  LBXTC: { SI: 'ммоль/л', US: 'мг/дл' },
  LBDHDD: { SI: 'ммоль/л', US: 'мг/дл' },
  LBXTR: { SI: 'ммоль/л', US: 'мг/дл' },
  LBXSAT: { SI: 'ед/л', US: 'ед/л' },
  LBXSASS: { SI: 'ед/л', US: 'ед/л' },
  LBXSUA: { SI: 'мкмоль/л', US: 'мг/дл' },
  LBXSCR: { SI: 'мкмоль/л', US: 'мг/дл' },
  LBXSBU: { SI: 'мг/дл', US: 'мг/дл' },
  LBXSAL: { SI: 'г/дл', US: 'г/дл' },
  LBXSAPSI: { SI: 'ед/л', US: 'ед/л' },
  LBXSTB: { SI: 'мкмоль/л', US: 'мг/дл' },
  LBXCRP: { SI: 'мг/дл', US: 'мг/дл' },
  LBXVIDMS: { SI: 'нг/мл', US: 'нг/мл' },
  LBXHGB: { SI: 'г/л', US: 'г/дл' },
  LBXRBCSI: { SI: '10^6/мкл', US: '10^6/мкл' },
  LBXWBCSI: { SI: 'тыс/мкл', US: '10^9/л' },
  LBXLYPCT: { SI: '%', US: '%' },
  LBXMCVSI: { SI: 'фл', US: 'фл' },
  LBXRDW: { SI: '%', US: '%' },
  URXUMA: { SI: 'мкг/мл', US: 'мкг/мл' },
}

function roundValue(value: number): number {
  return Number(value.toFixed(4))
}

export function isConvertibleField(field: keyof ScreeningFormValues): field is ConvertibleNumericField {
  return CONVERTIBLE_NUMERIC_FIELDS.includes(field as ConvertibleNumericField)
}

export function convertNumberValue(
  field: ConvertibleNumericField,
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) {
    return value
  }

  const factor = SI_TO_US_FACTORS[field]
  return from === 'SI' ? roundValue(value * factor) : roundValue(value / factor)
}

export function convertSingleFormFieldUnit(
  values: ScreeningFormValues,
  field: ConvertibleNumericField,
  from: UnitSystem,
  to: UnitSystem,
): ScreeningFormValues {
  if (from === to || values[field] === '') {
    return values
  }

  return {
    ...values,
    [field]: convertNumberValue(field, values[field], from, to),
  }
}

export function convertPayloadToUS(
  payload: ScreeningPayload,
  fieldUnitSystemMap: FieldUnitSystemMap,
): ScreeningPayload {

  const normalizedPayload = { ...payload }

  CONVERTIBLE_NUMERIC_FIELDS.forEach((field) => {
    const fieldValue = payload[field]

    if (fieldValue === null) {
      return
    }

    const fieldUnitSystem = fieldUnitSystemMap[field]
    normalizedPayload[field] =
      fieldUnitSystem === 'SI' ? convertNumberValue(field, fieldValue, 'SI', 'US') : fieldValue
  })

  return normalizedPayload
}

export function convertRangeToUnitSystem(
  field: keyof ScreeningFormValues,
  min: number,
  max: number,
  unitSystem: UnitSystem,
): { min: number; max: number } {
  if (!isConvertibleField(field) || unitSystem === 'US') {
    return { min, max }
  }

  return {
    min: roundValue(convertNumberValue(field, min, 'US', 'SI')),
    max: roundValue(convertNumberValue(field, max, 'US', 'SI')),
  }
}

export function getFieldUnitLabel(
  field: keyof ScreeningFormValues,
  unitSystem: UnitSystem,
): string | undefined {
  return FIELD_UNIT_LABELS[field]?.[unitSystem]
}

export function getFieldUnitLabelByMap(
  field: keyof ScreeningFormValues,
  fieldUnitSystemMap: FieldUnitSystemMap,
): string | undefined {
  if (!isConvertibleField(field)) {
    return FIELD_UNIT_LABELS[field]?.SI
  }

  return FIELD_UNIT_LABELS[field]?.[fieldUnitSystemMap[field]]
}
