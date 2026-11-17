import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// Instancia única de Axios para toda la app.
// withCredentials: el navegador manda la cookie HttpOnly en cada petición (el front nunca ve el token).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Endpoints donde un 401 es una respuesta normal y no significa "se venció la sesión"
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const detail = (data as { detail?: unknown } | undefined)?.detail

      const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta))
      const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'

      if (sesionVencida || cuentaDesactivada) {
        // limpio la sesión; ProtectedRoute se encarga de mandar a /login
        useAuthStore.getState().limpiarSesion()
      }
    }
    return Promise.reject(error)
  },
)
