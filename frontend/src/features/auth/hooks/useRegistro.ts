import { useMutation } from '@tanstack/react-query'
import { registerRequest } from '../api/auth'
import type { UserCreate } from '../types/auth'

export function useRegistro() {
  return useMutation({ mutationFn: (datos: UserCreate) => registerRequest(datos) })
}
