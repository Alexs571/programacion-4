import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Instancia única de TanStack Query (caché del estado del servidor)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // no reintento los errores del cliente (401, 403, 404...): reintentar no los arregla
      retry: (intentos, error) => {
        if (axios.isAxiosError(error) && error.response && error.response.status < 500) return false
        return intentos < 1
      },
    },
  },
})
