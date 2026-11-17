import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  roles?: Rol[] // si no se pasa, alcanza con tener sesión
}

// Protección visual de rutas. La protección real está en el backend (require_role).
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return <p className="py-16 text-center text-gray-500">Verificando sesión…</p>
  }
  if (!usuario) {
    // guardo a dónde quería ir para volver después del login
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
