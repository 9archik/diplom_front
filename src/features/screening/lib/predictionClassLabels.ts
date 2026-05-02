const CLASS_LABEL_RU: Record<string, string> = {
  '0': 'Норма',
  '1': 'Преддиабет',
  '2': 'Диабет',
}

export function getPredictionClassLabelRu(key: string): string {
  return CLASS_LABEL_RU[key] ?? key
}
