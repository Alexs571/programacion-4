import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Campo, Input } from '@/shared/ui/Input'
import { emailValido, largo } from '@/shared/utils/validaciones'
import { useAuthStore } from '@/store/authStore'
import { useRegistro } from '../hooks/useRegistro'

const validarUsername = largo(3, 50)
const validarNombre = largo(2, 100)
const validarPassword = (v: string) => (v.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined)

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const registro = useRegistro()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registro.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        // después del registro inicio sesión directamente
        await login(value.username.trim(), value.password)
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">Crear cuenta</h1>
        <p className="mb-5 text-sm text-gray-500">Registrate para hacer pedidos</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="username" validators={{ onChange: ({ value }) => validarUsername(value), onSubmit: ({ value }) => validarUsername(value) }}>
            {(field) => (
              <Campo id="username" label="Usuario" errores={field.state.meta.errors}>
                <Input id="username" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field name="full_name" validators={{ onChange: ({ value }) => validarNombre(value), onSubmit: ({ value }) => validarNombre(value) }}>
            {(field) => (
              <Campo id="full_name" label="Nombre completo" errores={field.state.meta.errors}>
                <Input id="full_name" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field name="email" validators={{ onChange: ({ value }) => emailValido(value), onSubmit: ({ value }) => emailValido(value) }}>
            {(field) => (
              <Campo id="email" label="Email" errores={field.state.meta.errors}>
                <Input id="email" type="email" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field name="password" validators={{ onChange: ({ value }) => validarPassword(value), onSubmit: ({ value }) => validarPassword(value) }}>
            {(field) => (
              <Campo id="password" label="Contraseña (mínimo 8 caracteres)" errores={field.state.meta.errors}>
                <Input id="password" type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>
          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              // mientras escribe, solo avisa si ya puso algo en este campo
              onChange: ({ value, fieldApi }) =>
                value && value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
              onSubmit: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
            }}
          >
            {(field) => (
              <Campo id="confirmar" label="Repetir contraseña" errores={field.state.meta.errors}>
                <Input id="confirmar" type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
              </Campo>
            )}
          </form.Field>

          {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([puedeEnviar, enviando]) => (
              <Button type="submit" className="w-full" disabled={!puedeEnviar || enviando}>
                {enviando ? 'Creando cuenta…' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
