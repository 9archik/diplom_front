import axios from 'axios'

/** Разбирает тело ошибки FastAPI (detail: string | объект[] и т.п.) в строку для UI */
export function normalizeFastApiDetailToString(data: unknown): string | null {
  if (data === undefined || data === null || typeof data !== 'object') {
    return null
  }

  const { detail } = data as Record<string, unknown>

  if (typeof detail === 'string' && detail.trim() !== '') {
    return detail.trim()
  }

  if (!Array.isArray(detail) || detail.length === 0) {
    return null
  }

  const parts: string[] = []

  for (const item of detail) {
    if (typeof item === 'string' && item.trim() !== '') {
      parts.push(item.trim())
      continue
    }

    if (typeof item !== 'object' || item === null) {
      continue
    }

    const row = item as Record<string, unknown>
    const rawMsg = row.msg

    if (typeof rawMsg === 'string' && rawMsg.trim() !== '') {
      parts.push(rawMsg.trim())
      continue
    }

    const loc = row.loc
    const suffix = Array.isArray(loc)
      ? String(loc.slice(-3).join('.')).replace(/^body\.?/, '').replace(/^query\.?/, '')
      : ''
    const types = typeof row.type === 'string' ? row.type : ''
    const merged = `${suffix}${suffix ? ': ' : ''}${types || 'ошибка валидации'}`.trim()

    if (merged !== '') {
      parts.push(merged)
    }
  }

  if (parts.length === 0) {
    return null
  }

  return parts.join(' ')
}

export function getAxiosFastApiMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const normalized = normalizeFastApiDetailToString(error.response?.data)
  if (normalized !== null) {
    return normalized
  }

  const statusText = error.response?.statusText
  if (typeof statusText === 'string' && statusText.trim() !== '') {
    return statusText.trim()
  }

  return fallback
}
