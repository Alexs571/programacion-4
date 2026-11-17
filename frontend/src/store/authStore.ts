import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/api/auth'
import type { UserPublic } from '@/features/auth/types/auth'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean // true mientras checkSession confirma la sesión con /auth/me
  login: (username: string, password: string) => Promise<UserPublic>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // 1) el backend pone la cookie HttpOnly  2) pido el perfil para saber nombre y rol
        await loginRequest(username, password)
        const usuario = await meRequest()
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await meRequest()
          set({ usuario, cargando: false })
        } catch {
          // sin cookie, vencida o cuenta desactivada: no hay sesión
          set({ usuario: null, cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      // solo se guarda el usuario (nombre, email, rol). El token NUNCA: vive en la cookie HttpOnly.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
