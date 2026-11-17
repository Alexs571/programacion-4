import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, TextArea } from '@/shared/ui/Input'
import { largo } from '@/shared/utils/validaciones'
import type { CategoriaCreate, CategoriaRead } from '../types/categoria'

interface CategoriaFormProps {
  categoria: CategoriaRead | null
  enviando: boolean
  onGuardar: (datos: CategoriaCreate) => Promise<void>
  onCancelar: () => void
}

const validarNombre = largo(2, 100)

export function CategoriaForm({ categoria, enviando, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-3"
    >
      <form.Field name="nombre" validators={{ onChange: ({ value }) => validarNombre(value), onSubmit: ({ value }) => validarNombre(value) }}>
        {(field) => (
          <Campo id="cat-nombre" label="Nombre" errores={field.state.meta.errors}>
            <Input id="cat-nombre" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Campo id="cat-descripcion" label="Descripción" errores={field.state.meta.errors}>
            <TextArea id="cat-descripcion" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(puedeEnviar) => (
            <Button type="submit" disabled={!puedeEnviar || enviando}>
              {enviando ? 'Guardando…' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
