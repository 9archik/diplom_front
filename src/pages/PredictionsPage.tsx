import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePredictionsQuery } from '../features/screening/hooks/usePredictionsQuery'
import { getPredictionClassLabelRu } from '../features/screening/lib/predictionClassLabels'
import { PREDICTION_MODE_OPTIONS } from '../features/screening/model/types'

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
]

const modeLabelMap = new Map(PREDICTION_MODE_OPTIONS.map((item) => [item.value, item.label]))

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('ru-RU')
}

function getProbabilityPercent(value: number) {
  if (value <= 1) {
    return value * 100
  }

  return value
}

export function PredictionsPage() {
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)
  const predictionsQuery = usePredictionsQuery(skip, limit)

  const predictions = predictionsQuery.data ?? []
  const canGoNext = predictions.length === limit

  const handleLimitChange = (value: string | null) => {
    if (!value) {
      return
    }

    setLimit(Number(value))
    setSkip(0)
  }

  return (
    <Container size="lg" className="py-8">
      <Stack gap="md">
        <Group justify="space-between" align="end">
          <div>
            <Title order={2} c="blue.8">
              История предсказаний
            </Title>
            <Text c="dimmed" size="sm">
              Список результатов из `/predictions/`
            </Text>
          </div>

          <Group>
            <Select
              label="Лимит"
              value={String(limit)}
              data={PAGE_SIZE_OPTIONS}
              onChange={handleLimitChange}
              allowDeselect={false}
              w={90}
            />
            <Button
              variant="default"
              disabled={skip === 0 || predictionsQuery.isFetching}
              onClick={() => setSkip((prev) => Math.max(prev - limit, 0))}
            >
              Назад
            </Button>
            <Button
              disabled={!canGoNext || predictionsQuery.isFetching}
              onClick={() => setSkip((prev) => prev + limit)}
            >
              Далее
            </Button>
          </Group>
        </Group>

        {predictionsQuery.isLoading ? (
          <Paper withBorder radius="md" p="xl">
            <Group justify="center">
              <Loader color="blue" />
            </Group>
          </Paper>
        ) : null}

        {predictionsQuery.isError ? (
          <Paper withBorder radius="md" p="lg">
            <Text c="red">Не удалось загрузить список предсказаний.</Text>
          </Paper>
        ) : null}

        {!predictionsQuery.isLoading && !predictionsQuery.isError && predictions.length === 0 ? (
          <Paper withBorder radius="md" p="lg">
            <Text c="dimmed">Предсказаний пока нет.</Text>
          </Paper>
        ) : null}

        <Stack gap="sm">
          {predictions.map((prediction) => (
            <Card key={prediction.id} withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge color="blue" variant="light">
                    {modeLabelMap.get(prediction.mode) ?? prediction.mode}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {formatDate(prediction.created_at)}
                  </Text>
                </Group>

                <Text fw={700}>{prediction.name || 'Без названия'}</Text>

                <Text fw={600}>
                  Класс: {prediction.class_label} ({prediction.predicted_class})
                </Text>

                <Text size="sm" c="dimmed">
                  Вероятности:{' '}
                  {Object.entries(prediction.probabilities)
                    .map(
                      ([key, value]) =>
                        `${getPredictionClassLabelRu(key)}: ${getProbabilityPercent(value).toFixed(1)}%`,
                    )
                    .join(' · ')}
                </Text>

                {prediction.top_factors.length > 0 ? (
                  <Text size="sm">
                    Топ-факторы:{' '}
                    {prediction.top_factors
                      .slice(0, 3)
                      .map((factor) => `${factor.label || factor.feature} (${factor.value})`)
                      .join(', ')}
                  </Text>
                ) : null}

                <Group justify="flex-end">
                  <Button
                    component={Link}
                    to={`/predictions/${prediction.id}`}
                    variant="light"
                    size="xs"
                    color="blue"
                  >
                    Подробнее
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
