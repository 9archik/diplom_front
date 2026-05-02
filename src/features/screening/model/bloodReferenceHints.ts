import { isConvertibleField } from '../lib/unitConverter'
import type { BinaryInputValue, FieldUnitSystemMap, ScreeningFormValues, UnitSystem } from './types'

type DualUnitHints = Record<UnitSystem, string>

const CONVERTIBLE_HINTS: Partial<Record<keyof ScreeningFormValues, DualUnitHints>> = {
  LBXGLU: {
    SI: '3,9–5,5 ммоль/л',
    US: '70–99 мг/дл',
  },
  LBXTC: {
    SI: '<5,2 ммоль/л',
    US: '<200 мг/дл',
  },
  LBDHDD: {
    SI: '>1 ммоль/л',
    US: '>40 мг/дл',
  },
  LBXTR: {
    SI: '<1,7 ммоль/л',
    US: '<150 мг/дл',
  },
  LBXSCR: {
    SI: '62–115 мкмоль/л',
    US: '0,7–1,3 мг/дл',
  },
  LBXSTB: {
    SI: '5–21 мкмоль/л',
    US: '<1,2 мг/дл',
  },
  LBXSUA: {
    SI: '210–420 мкмоль/л (М)',
    US: '3,5–7,2 мг/дл (М)',
  },
  LBXWBCSI: {
    SI: '4–9 тыс/мкл',
    US: '4–9 ·10^9/л',
  },
}

const FIXED_HINTS: Partial<Record<keyof ScreeningFormValues, string>> = {
  LBXSAT: '<40 Ед/л',
  LBXSASS: '<40 Ед/л',
  LBXSBU: '7–20 мг/дл',
  LBXSAL: '35–52 г/л',
  LBXSAPSI: '40–130 Ед/л',
  LBXCRP: 'низкий вне воспаления',
  LBXVIDMS: '≥30 нг/мл',
  LBXRBCSI: 'ж 3,9–5,2 · м 4,3–5,9',
  LBXLYPCT: '19–37%',
  LBXMCVSI: '80–100 фл',
  LBXRDW: '11,5–14,5%',
  URXUMA: 'см. референс лаборатории',
}

const HGB_HINT_BY_GENDER_UNIT: Record<
  Exclude<BinaryInputValue, ''>,
  Record<UnitSystem, string>
> = {
  '0': {
    SI: '134–175 г/л',
    US: '13,5–17,5 г/дл',
  },
  '1': {
    SI: '117–155 г/л',
    US: '12–15,5 г/дл',
  },
}

const HGB_HINT_FALLBACK: DualUnitHints = {
  SI: 'ж 117–155 · м 134–175 г/л',
  US: 'ж 12–15,5 · м 13,5–17,5 г/дл',
}

const RBCSI_HINT_BY_GENDER: Record<Exclude<BinaryInputValue, ''>, string> = {
  '0': '4,3–5,9',
  '1': '3,9–5,2',
}

export function getBloodReferenceHint(
  field: keyof ScreeningFormValues,
  fieldUnitSystemMap: FieldUnitSystemMap,
  gender: BinaryInputValue,
): string | undefined {
  if (field === 'LBXHGB') {
    const unit = fieldUnitSystemMap.LBXHGB
    if (gender === '0' || gender === '1') {
      return HGB_HINT_BY_GENDER_UNIT[gender][unit]
    }

    return HGB_HINT_FALLBACK[unit]
  }

  if (field === 'LBXRBCSI') {
    if (gender === '0' || gender === '1') {
      return RBCSI_HINT_BY_GENDER[gender]
    }

    return FIXED_HINTS.LBXRBCSI
  }

  if (!isConvertibleField(field)) {
    return FIXED_HINTS[field]
  }

  const dual = CONVERTIBLE_HINTS[field]
  return dual ? dual[fieldUnitSystemMap[field]] : undefined
}
