import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Link, useNavigate } from 'react-router-dom'

import { useRegister } from '../hooks/useRegister'
import { EMAIL_PATTERN } from '../lib/emailPattern'
import type { RegisterRequest } from '../model/types'

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const form = useForm<RegisterRequest>({
    initialValues: {
      name: '',
      surname: '',
      patronymic: '',
      email: '',
      password: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Имя обязательно'),
      surname: (value) => (value.trim().length > 0 ? null : 'Фамилия обязательна'),
      patronymic: (value) => (value.trim().length > 0 ? null : 'Отчество обязательно'),
      email: (value) => (EMAIL_PATTERN.test(value) ? null : 'Введите корректный email'),
      password: (value) => (value.trim().length > 0 ? null : 'Пароль обязателен'),
    },
  })

  const handleSubmit = (values: RegisterRequest) => {
    registerMutation.mutate(values, {
      onSuccess: () => navigate('/login'),
    })
  }

  return (
    <Paper withBorder shadow="sm" radius="lg" p="xl" className="w-full max-w-lg bg-white">
      <Title order={2} ta="center" mb="lg" c="blue.8">
        Регистрация
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput label="Имя" withAsterisk {...form.getInputProps('name')} />
          <TextInput label="Фамилия" withAsterisk {...form.getInputProps('surname')} />
          <TextInput label="Отчество" withAsterisk {...form.getInputProps('patronymic')} />
          <TextInput
            label="Email"
            placeholder="you@example.com"
            withAsterisk
            {...form.getInputProps('email')}
          />
          <PasswordInput label="Пароль" withAsterisk {...form.getInputProps('password')} />

          <Button type="submit" loading={registerMutation.isPending} color="blue" fullWidth>
            Зарегистрироваться
          </Button>
        </Stack>
      </form>

      <Text size="sm" mt="md" ta="center" c="dimmed">
        Уже есть аккаунт?{' '}
        <Text component={Link} to="/login" span c="blue.7">
          Войти
        </Text>
      </Text>
    </Paper>
  )
}
