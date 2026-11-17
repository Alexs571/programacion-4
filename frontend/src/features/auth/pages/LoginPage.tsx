import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Campo, Input } from '@/shared/ui/Input'
import { requerido } from '@/shared/utils/validaciones'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const desde = (location.state as { desde?: string } | null)?.desde
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const usuario = await login(value.username.trim(), value.password)
        // vuelvo a donde quería ir; si no, el admin va al panel y el cliente al catálogo
        navigate(desde ?? (usuario.role === 'admin' ? '/admin/resumen' : '/'), { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">Iniciar sesión</h1>
        <p className="mb-5 text-sm text-gray-500">Ingresá con tu usuario de Food Store</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="username" validators={{ onChange: ({ value }) => requerido(value), onSubmit: ({ value }) => requerido(value) }}>
            {(field) => (
              <Campo id="username" label="Usuario" errores={field.state.meta.errors}>
                <Input
                  id="username"
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>
          <form.Field name="password" validators={{ onChange: ({ value }) => requerido(value), onSubmit: ({ value }) => requerido(value) }}>
            {(field) => (
              <Campo id="password" label="Contraseña" errores={field.state.meta.errors}>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Campo>
            )}
          </form.Field>

          {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([puedeEnviar, enviando]) => (
              <Button type="submit" className="w-full" disabled={!puedeEnviar || enviando}>
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
