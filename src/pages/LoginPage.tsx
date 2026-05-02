import { Container } from '@mantine/core'

import { LoginForm } from '../features/auth/ui/LoginForm'

export function LoginPage() {
  return (
    <Container fluid className="flex min-h-screen items-center justify-center px-4 py-8">
      <LoginForm />
    </Container>
  )
}
