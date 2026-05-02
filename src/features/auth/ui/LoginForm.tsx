import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Link, useNavigate } from 'react-router-dom'

import { useLogin } from '../hooks/useLogin'
import { EMAIL_PATTERN } from '../lib/emailPattern'
import { useAuth } from '../providers/auth-context'
import type { LoginRequest } from '../model/types'

export function LoginForm() {
  const navigate = useNavigate()
  const { refetchProfile } = useAuth()
  const loginMutation = useLogin()

  const form = useForm<LoginRequest>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (EMAIL_PATTERN.test(value) ? null : 'Введите корректный email'),
      password: (value) => (value.trim().length > 0 ? null : 'Пароль обязателен'),
    },
    validateInputOnBlur: true,
  })

  const handleSubmit = (values: LoginRequest) => {
    loginMutation.mutate(values, {
      onSuccess: async () => {
        await refetchProfile()
        navigate('/screening')
      },
    })
  }

  return (
    <Paper withBorder shadow="sm" radius="lg" p="xl" className="w-full max-w-md bg-white">
      <Title order={2} ta="center" mb="lg" c="blue.8">
        Вход в систему
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="you@example.com"
            withAsterisk
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Введите пароль"
            withAsterisk
            {...form.getInputProps('password')}
          />

          <Button type="submit" loading={loginMutation.isPending} color="blue" fullWidth>
            Войти
          </Button>
        </Stack>
      </form>

      <Text size="sm" mt="md" ta="center" c="dimmed">
        Нет аккаунта?{' '}
        <Text component={Link} to="/register" span c="blue.7">
          Зарегистрироваться
        </Text>
      </Text>
    </Paper>
  )
}
