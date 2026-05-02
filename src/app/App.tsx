import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Center, Loader } from '@mantine/core'

import { AppProviders } from './providers/AppProviders'
import { AuthorizedLayout } from './layouts/AuthorizedLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ScreeningPage } from '../pages/ScreeningPage'
import { PredictionsPage } from '../pages/PredictionsPage'
import { PredictionDetailsPage } from '../pages/PredictionDetailsPage'
import { useAuth } from '../features/auth/providers/auth-context'

function AuthLoadingScreen() {
  return (
    <Center className="min-h-screen">
      <Loader color="blue" />
    </Center>
  )
}

function GuestOnlyRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate replace to="/screening" />
  }

  return <Outlet />
}

function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <Outlet />
}

function AppRoutes() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const fallbackPath = isAuthLoading ? '/login' : isAuthenticated ? '/screening' : '/login'

  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthorizedLayout />}>
          <Route path="/screening" element={<ScreeningPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/predictions/:id" element={<PredictionDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to={fallbackPath} />} />
    </Routes>
  )
}

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}
