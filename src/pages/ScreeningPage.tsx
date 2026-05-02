import { Container } from '@mantine/core'

import { ScreeningForm } from '../features/screening/ui/ScreeningForm'

export function ScreeningPage() {
  return (
    <Container fluid className="flex justify-center px-0 py-2 lg:py-4">
      <ScreeningForm />
    </Container>
  )
}
