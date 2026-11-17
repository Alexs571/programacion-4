import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // única llamada en useEffect: confirmar la sesión con /auth/me al montar la app
  useEffect(() => {
    checkSession()
  }, [checkSession])

  return <AppRouter />
}

export default App
