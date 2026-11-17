import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Campo, Input } from '@/shared/ui/Input'
import { numeroMinimo } from '@/shared/utils/validaciones'
import type { ProductoRead, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: ProductoRead
  enviando: boolean
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
}

const validarStock = (v: number) => numeroMinimo(0)(v) ?? (Number.isInteger(v) ? undefined : 'Tiene que ser un número entero')

// Formulario chico para PATCH /productos/{id}/stock
export function StockForm({ producto, enviando, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => onGuardar(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <p className="text-sm text-gray-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value), onSubmit: ({ value }) => validarStock(value) }}>
        {(field) => (
          <Campo id="stock-nuevo" label="Stock" errores={field.state.meta.errors}>
            <Input id="stock-nuevo" type="number" min={0} step={1} value={Number.isNaN(field.state.value) ? '' : field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.valueAsNumber)} />
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
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(puedeEnviar) => (
            <Button type="submit" disabled={!puedeEnviar || enviando}>
              {enviando ? 'Guardando…' : 'Actualizar stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
