import { Container } from '@mantine/core'

import { RegisterForm } from '../features/auth/ui/RegisterForm'

export function RegisterPage() {
  return (
    <Container fluid className="flex min-h-screen items-center justify-center px-4 py-8">
      <RegisterForm />
    </Container>
  )
}
