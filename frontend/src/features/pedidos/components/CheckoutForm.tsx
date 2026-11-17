import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, Select, TextArea } from '@/shared/ui/Input'
import { largo } from '@/shared/utils/validaciones'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  enviando: boolean
  onConfirmar: (datos: DatosCheckout) => Promise<void>
}

const validarDireccion = largo(5, 200)
const validarNotas = (v: string) => (v.length > 500 ? 'Máximo 500 caracteres' : undefined)

export function CheckoutForm({ enviando, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => onConfirmar(value),
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
      <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => validarDireccion(value), onSubmit: ({ value }) => validarDireccion(value) }}>
        {(field) => (
          <Campo id="direccion_entrega" label="Dirección de entrega" errores={field.state.meta.errors}>
            <Input id="direccion_entrega" placeholder="Calle, número, piso…" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <Campo id="forma_pago" label="Forma de pago" errores={field.state.meta.errors}>
            <Select id="forma_pago" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </Select>
          </Campo>
        )}
      </form.Field>
      <form.Field name="notas" validators={{ onChange: ({ value }) => validarNotas(value) }}>
        {(field) => (
          <Campo id="notas" label="Notas (opcional)" errores={field.state.meta.errors}>
            <TextArea id="notas" rows={3} placeholder="Ej: tocar timbre 2B" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <form.Subscribe selector={(s) => s.canSubmit}>
        {(puedeEnviar) => (
          <Button type="submit" className="w-full" disabled={!puedeEnviar || enviando}>
            {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
