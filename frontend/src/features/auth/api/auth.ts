import { api } from '@/shared/api/axiosInstance'
import type { MensajeResponse, UserCreate, UserPublic } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<MensajeResponse> {
  // el login es un formulario OAuth2 (application/x-www-form-urlencoded)
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeResponse>('/auth/token', form)
  return data
}

export async function registerRequest(datos: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>('/auth/register', datos)
  return data
}

export async function meRequest(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>('/auth/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout')
}
