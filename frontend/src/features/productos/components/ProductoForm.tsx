import { useForm } from '@tanstack/react-form'
import type { CategoriaRead } from '@/features/categorias/types/categoria'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, Select, TextArea } from '@/shared/ui/Input'
import { largo, numeroMinimo } from '@/shared/utils/validaciones'
import type { ProductoCreate, ProductoRead } from '../types/producto'

interface ProductoFormProps {
  producto: ProductoRead | null // null = alta
  categorias: CategoriaRead[]
  enviando: boolean
  onGuardar: (datos: ProductoCreate) => Promise<void>
  onCancelar: () => void
}

const validarNombre = largo(2, 150)
const validarPrecio = numeroMinimo(0)
const validarStock = (v: number) => numeroMinimo(0)(v) ?? (Number.isInteger(v) ? undefined : 'Tiene que ser un número entero')
const validarCategoria = (v: number) => (v > 0 ? undefined : 'Elegí una categoría')

export function ProductoForm({ producto, categorias, enviando, onGuardar, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: async ({ value }) => {
      await onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      })
    },
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
          <Campo id="nombre" label="Nombre" errores={field.state.meta.errors}>
            <Input id="nombre" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Campo id="descripcion" label="Descripción" errores={field.state.meta.errors}>
            <TextArea id="descripcion" rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarPrecio(value), onSubmit: ({ value }) => validarPrecio(value) }}>
          {(field) => (
            <Campo id="precio_base" label="Precio" errores={field.state.meta.errors}>
              <Input id="precio_base" type="number" step="0.01" min={0} value={Number.isNaN(field.state.value) ? '' : field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.valueAsNumber)} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value), onSubmit: ({ value }) => validarStock(value) }}>
          {(field) => (
            <Campo id="stock" label="Stock" errores={field.state.meta.errors}>
              <Input id="stock" type="number" min={0} step={1} value={Number.isNaN(field.state.value) ? '' : field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.valueAsNumber)} />
            </Campo>
          )}
        </form.Field>
      </div>
      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => validarCategoria(value), onSubmit: ({ value }) => validarCategoria(value) }}>
        {(field) => (
          <Campo id="categoria_id" label="Categoría" errores={field.state.meta.errors}>
            <Select id="categoria_id" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))}>
              <option value={0}>Elegí una categoría…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <Campo id="imagen_url" label="URL de la imagen" errores={field.state.meta.errors}>
            <Input id="imagen_url" placeholder="https://…" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
            Disponible para la venta
          </label>
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
