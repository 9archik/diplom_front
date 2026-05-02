export interface RegisterRequest {
  email: string
  password: string
  name: string
  surname: string
  patronymic: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface Profile {
  id: string
  email: string
  name: string
  surname: string
  patronymic: string
  is_active: boolean
  created_at: string
}
