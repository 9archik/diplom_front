import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { usePredictionDetailsQuery } from '../features/screening/hooks/usePredictionDetailsQuery'
import { getPredictionClassLabelRu } from '../features/screening/lib/predictionClassLabels'
import { getFieldUnitLabel } from '../features/screening/lib/unitConverter'
import { PredictionFeedbackCard } from '../features/screening/ui/PredictionFeedbackCard'
import { useUpdatePredictionMode } from '../features/screening/hooks/useUpdatePredictionMode'
import {
  CONVERTIBLE_NUMERIC_FIELDS,
  PREDICTION_MODE_OPTIONS,
  type UnitSystem,
  type PredictionModel,
  type ScreeningFormValues,
} from '../features/screening/model/types'

const modeLabelMap = new Map(PREDICTION_MODE_OPTIONS.map((item) => [item.value, item.label]))
const INPUT_LABELS_MAP: Record<string, string> = {
  RIDAGEYR: 'Возраст',
  RIAGENDR: 'Пол',
  BMXHT: 'Рост',
  weight_kg: 'Вес',
  BMXWAIST: 'Окружность талии',
  hypertension: 'Артериальная гипертензия',
  HSD010: 'Самооценка состояния здоровья',
  LBXGLU: 'Глюкоза натощак',
  LBXTC: 'Общий холестерин',
  LBDHDD: 'ЛПВП-холестерин (HDL)',
  LBXTR: 'Триглицериды',
  LBXSAT: 'АЛТ',
  LBXSASS: 'АСТ',
  LBXSUA: 'Мочевая кислота',
  LBXSCR: 'Креатинин',
  LBXSBU: 'Мочевина (BUN)',
  LBXSAL: 'Альбумин',
  LBXSAPSI: 'Щелочная фосфатаза (ALP)',
  LBXSTB: 'Общий билирубин',
  LBXCRP: 'С-реактивный белок (СРБ)',
  LBXVIDMS: 'Витамин D (25-OH)',
  LBXHGB: 'Гемоглобин',
  LBXRBCSI: 'Эритроциты (RBC)',
  LBXWBCSI: 'Лейкоциты (WBC)',
  LBXLYPCT: 'Процент лимфоцитов',
  LBXMCVSI: 'Средний объем эритроцита (MCV)',
  LBXRDW: 'Ширина распределения эритроцитов (RDW)',
  URXUMA: 'Микроальбумин мочи',
  MCQ300C: 'Семейный анамнез сахарного диабета',
  MCQ160A: 'Инфаркт миокарда в анамнезе',
  MCQ160E: 'Инсульт в анамнезе',
  MCQ160F: 'Хроническая сердечная недостаточность',
  DMDEDUC2: 'Уровень образования',
  INDFMPIR: 'Индекс дохода семьи',
  BMXBMI: 'Индекс массы тела (BMI)',
  eGFR: 'Скорость клубочковой фильтрации (eGFR)',
}
type InputPrimitiveValue = number | string | boolean | null
type InputValueLabelsMap = Record<string, Record<string, string>>
type InputFieldKey = keyof ScreeningFormValues

const BINARY_NO_YES_LABELS: Record<string, string> = {
  0: 'Нет',
  1: 'Да',
}

const INPUT_VALUE_LABELS_MAP: InputValueLabelsMap = {
  RIAGENDR: {
    0: 'Мужской',
    1: 'Женский',
  },
  HSD010: {
    1: 'Отличное',
    2: 'Очень хорошее',
    3: 'Хорошее',
    4: 'Удовлетворительное',
    5: 'Плохое',
  },
  MCQ300C: {
    '-1': 'Неизвестно',
    0: 'Нет',
    1: 'Да (родители или братья/сёстры)',
  },
  DMDEDUC2: {
    1: 'Менее 9 классов',
    2: '9-11 классов (без аттестата)',
    3: 'Среднее общее (аттестат)',
    4: 'Среднее специальное / неполное высшее',
    5: 'Высшее и выше',
  },
  hypertension: BINARY_NO_YES_LABELS,
  MCQ160A: BINARY_NO_YES_LABELS,
  MCQ160E: BINARY_NO_YES_LABELS,
  MCQ160F: BINARY_NO_YES_LABELS,
}

const INPUT_FIELD_KEYS_WITH_UNITS: ReadonlySet<InputFieldKey> = new Set([
  'RIDAGEYR',
  'BMXHT',
  'weight_kg',
  'BMXWAIST',
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
  'LBXHGB',
  'LBXRBCSI',
  'LBXWBCSI',
  'LBXLYPCT',
  'LBXMCVSI',
  'LBXRDW',
  'URXUMA',
])

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('ru-RU')
}

function normalizeProbability(value: number) {
  if (value <= 1) {
    return value * 100
  }

  return value
}

const META_KEYS = new Set([
  'id',
  'name',
  'mode',
  'predicted_class',
  'class_label',
  'probabilities',
  'top_factors',
  'created_at',
  'user_input_data',
  'input_data',
  'input_features',
  'features',
  'computed_data',
])

function isPrimitiveValue(value: unknown): value is InputPrimitiveValue {
  return (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
  )
}

function isPrimitiveEntry(
  entry: [string, unknown],
): entry is [string, InputPrimitiveValue] {
  return isPrimitiveValue(entry[1])
}

function getInputEntries(prediction: Record<string, unknown>): Array<[string, InputPrimitiveValue]> {
  const nestedPayload =
    prediction.user_input_data ??
    prediction.input_data ??
    prediction.input_features ??
    prediction.features

  if (nestedPayload && typeof nestedPayload === 'object' && !Array.isArray(nestedPayload)) {
    return Object.entries(nestedPayload).filter(isPrimitiveEntry)
  }

  return Object.entries(prediction)
    .filter((entry) => !META_KEYS.has(entry[0]))
    .filter(isPrimitiveEntry)
    .sort(([a], [b]) => a.localeCompare(b))
}

function getFormattedCategoricalInputValue(key: string, value: InputPrimitiveValue): string | null {
  const valueLabelsMap = INPUT_VALUE_LABELS_MAP[key]
  if (!valueLabelsMap) {
    return null
  }

  const formattedValue = valueLabelsMap[String(value)]
  return formattedValue ?? null
}

function getInputUnitLabel(key: string): string | null {
  if (!INPUT_FIELD_KEYS_WITH_UNITS.has(key as InputFieldKey)) {
    return null
  }

  const unitSystem: UnitSystem = CONVERTIBLE_NUMERIC_FIELDS.includes(
    key as (typeof CONVERTIBLE_NUMERIC_FIELDS)[number],
  )
    ? 'US'
    : 'SI'

  return getFieldUnitLabel(key as InputFieldKey, unitSystem) ?? null
}

function formatInputValue(key: string, value: InputPrimitiveValue): string {
  const formattedCategoricalValue = getFormattedCategoricalInputValue(key, value)
  if (formattedCategoricalValue) {
    return formattedCategoricalValue
  }

  if (value === null || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'number') {
    const unitLabel = getInputUnitLabel(key)
    if (!unitLabel) {
      return String(value)
    }

    return `${value} ${unitLabel}`
  }

  return String(value)
}

function getInputLabel(key: string): string {
  return INPUT_LABELS_MAP[key] ?? key
}

function getFeedbackComment(prediction: Record<string, unknown>): string | null {
  const feedbackComment = prediction.feedback_comment
  if (typeof feedbackComment === 'string' && feedbackComment.trim().length > 0) {
    return feedbackComment
  }

  const comment = prediction.comment
  if (typeof comment === 'string' && comment.trim().length > 0) {
    return comment
  }

  return null
}

export function PredictionDetailsPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const predictionQuery = usePredictionDetailsQuery(id)
  const updateModeMutation = useUpdatePredictionMode()
  const prediction = predictionQuery.data
  const [nextMode, setNextMode] = useState<PredictionModel | null>(null)
  const inputEntries = prediction
    ? getInputEntries(prediction as Record<string, unknown>)
    : []
  const feedbackComment = prediction
    ? getFeedbackComment(prediction as Record<string, unknown>)
    : null
  const modeOptions = PREDICTION_MODE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }))
  const isModeUnchanged = !prediction || !nextMode || prediction.mode === nextMode

  useEffect(() => {
    if (!prediction) {
      return
    }

    setNextMode(prediction.mode)
  }, [prediction])

  const handleModeRecalculate = async () => {
    if (!prediction || !nextMode || nextMode === prediction.mode) {
      return
    }

    const updatedPrediction = await updateModeMutation.mutateAsync({
      predictionId: prediction.id,
      mode: nextMode,
    })

    queryClient.setQueryData(['prediction-details', prediction.id], updatedPrediction)
  }

  return (
    <Container size="lg" className="py-6">
      <Stack gap="md">
        <Group justify="space-between" align="start">
          <div>
            <Title order={2} c="blue.8">
              Детали предсказания
            </Title>
            <Text size="sm" c="dimmed">
              ID: {id}
            </Text>
          </div>

          <Button component={Link} to="/predictions" variant="default">
            К списку
          </Button>
        </Group>

        {predictionQuery.isLoading ? (
          <Paper withBorder radius="md" p="xl">
            <Group justify="center">
              <Loader color="blue" />
            </Group>
          </Paper>
        ) : null}

        {predictionQuery.isError ? (
          <Paper withBorder radius="md" p="lg">
            <Text c="red">Не удалось загрузить предсказание по id.</Text>
          </Paper>
        ) : null}

        {prediction ? (
          <Stack gap="md">
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge color="blue" variant="light">
                    {modeLabelMap.get(prediction.mode) ?? prediction.mode}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {formatDate(prediction.created_at)}
                  </Text>
                </Group>
                <Text fw={700}>
                  Результат: {prediction.class_label} ({prediction.predicted_class})
                </Text>
                <Text size="sm" c="dimmed">
                  Название: {prediction.name || 'Без названия'}
                </Text>
              </Stack>
            </Card>

            <Paper withBorder radius="md" p="md">
              <Title order={4} mb="md">
                Вероятности классов
              </Title>
              <Stack gap="sm">
                {Object.entries(prediction.probabilities).map(([label, value]) => {
                  const percentValue = normalizeProbability(value)
                  const labelText = getPredictionClassLabelRu(label)

                  return (
                    <div key={label}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" fw={500}>
                          {labelText}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {percentValue.toFixed(1)}%
                        </Text>
                      </Group>
                      <Progress value={percentValue} color="blue" radius="xl" />
                    </div>
                  )
                })}
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Stack gap="sm">
                <Title order={4}>Смена режима</Title>
                <Select
                  label="Режим предсказания"
                  placeholder="Выберите режим"
                  allowDeselect={false}
                  data={modeOptions}
                  value={nextMode}
                  onChange={(value) => {
                    if (!value) {
                      return
                    }

                    setNextMode(value as PredictionModel)
                  }}
                />
                <Button
                  onClick={handleModeRecalculate}
                  loading={updateModeMutation.isPending}
                  disabled={isModeUnchanged || updateModeMutation.isPending}
                >
                  Пересчитать
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Title order={4} mb="md">
                Введенные параметры
              </Title>
              {inputEntries.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Бэкенд не вернул параметры ввода для этого предсказания.
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
                  {inputEntries.map(([key, value]) => (
                    <Group key={key} justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">
                        {getInputLabel(key)}
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatInputValue(key, value)}
                      </Text>
                    </Group>
                  ))}
                </SimpleGrid>
              )}
            </Paper>

            <PredictionFeedbackCard
              predictionId={prediction.id}
              hasFeedback={prediction.has_feedback}
              existingComment={feedbackComment}
              onSubmitted={async () => {
                await predictionQuery.refetch()
              }}
            />

            <Paper withBorder radius="md" p="md">
              <Title order={4} mb="md">
                Топ-факторы (вклад SHAP)
              </Title>

              {prediction.top_factors.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Для этого предсказания топ-факторы отсутствуют.
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {prediction.top_factors.map((factor) => (
                    <Card key={`${factor.feature}-${factor.label}`} withBorder radius="md" p="sm">
                      <Stack gap={4}>
                        <Text fw={600}>{factor.label || factor.feature}</Text>
                        <Text size="sm" c="dimmed">
                          Признак: {factor.feature}
                        </Text>
                        <Text size="sm">Значение: {factor.value}</Text>
                        <Text size="sm" c="dimmed">
                          Норма: {factor.normal_range}
                        </Text>

                        <div>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm">SHAP</Text>
                            <Text size="sm" c={factor.shap_value >= 0 ? 'teal' : 'red'}>
                              {factor.shap_value.toFixed(4)}
                            </Text>
                          </Group>
                          <Progress
                            value={Math.min(Math.abs(factor.shap_value) * 100, 100)}
                            color={factor.shap_value >= 0 ? 'teal' : 'red'}
                            radius="xl"
                          />
                        </div>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Paper>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  )
}
