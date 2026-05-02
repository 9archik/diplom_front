import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { AuthProvider } from '../../features/auth/providers/AuthProvider'
import { appTheme } from './theme'

const queryClient = new QueryClient()

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider theme={appTheme}>
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
