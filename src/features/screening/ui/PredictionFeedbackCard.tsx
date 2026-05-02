import { Alert, Button, Paper, Select, Stack, Text, Textarea, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'

import { useCreatePredictionFeedback } from '../hooks/useCreatePredictionFeedback'
import type { FeedbackRealClass } from '../model/types'

interface PredictionFeedbackCardProps {
  predictionId: string
  hasFeedback: boolean
  existingComment?: string | null
  onSubmitted?: () => Promise<unknown> | void
}

interface FeedbackFormValues {
  realClass: string | null
  comment: string
}

const REAL_CLASS_OPTIONS = [
  { value: '0', label: 'Норма' },
  { value: '1', label: 'Преддиабет' },
  { value: '2', label: 'Диабет' },
]

export function PredictionFeedbackCard({
  predictionId,
  hasFeedback,
  existingComment = null,
  onSubmitted,
}: PredictionFeedbackCardProps) {
  const [submittedComment, setSubmittedComment] = useState<string | null>(existingComment)
  const [isLocallySubmitted, setIsLocallySubmitted] = useState(false)
  const createFeedbackMutation = useCreatePredictionFeedback()
  const form = useForm<FeedbackFormValues>({
    initialValues: {
      realClass: null,
      comment: '',
    },
    validate: {
      realClass: (value) => (value ? null : 'Выберите реальный класс'),
    },
  })

  const isSubmitted = hasFeedback || isLocallySubmitted

  const handleSubmit = form.onSubmit(async (values) => {
    if (!values.realClass) {
      return
    }

    const comment = values.comment.trim()

    await createFeedbackMutation.mutateAsync({
      predictionId,
      payload: {
        real_class: Number(values.realClass) as FeedbackRealClass,
        comment: comment.length > 0 ? comment : null,
      },
    })

    setIsLocallySubmitted(true)
    setSubmittedComment(comment.length > 0 ? comment : null)
    form.reset()

    if (onSubmitted) {
      await onSubmitted()
    }
  })

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Title order={4}>Обратная связь</Title>

        {isSubmitted ? (
          <Alert color="green" title="Статус">
            <Stack gap="xs">
              <Text size="sm">Отзыв уже отправлен.</Text>
              {submittedComment ? (
                <Text size="sm" c="dimmed">
                  Комментарий: {submittedComment}
                </Text>
              ) : null}
            </Stack>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <Select
                label="Реальный класс"
                placeholder="Выберите класс"
                withAsterisk
                allowDeselect={false}
                data={REAL_CLASS_OPTIONS}
                {...form.getInputProps('realClass')}
              />
              <Textarea
                label="Комментарий"
                placeholder="Необязательно"
                autosize
                minRows={3}
                maxRows={6}
                {...form.getInputProps('comment')}
              />
              <Button type="submit" loading={createFeedbackMutation.isPending}>
                Отправить отзыв
              </Button>
            </Stack>
          </form>
        )}
      </Stack>
    </Paper>
  )
}
