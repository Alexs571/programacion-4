import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import type { DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function onConfirmar(datos: DatosCheckout) {
    setError(null)
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      })
      vaciar()
      navigate('/mis-pedidos', { state: { creado: true } })
    } catch (e) {
      // stock insuficiente, producto no disponible, etc.: el carrito no se toca
      setError(handleApiError(e))
    }
  }

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="No hay productos en el carrito para confirmar.">
        <Link to="/" className="font-medium text-orange-700 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Confirmar pedido</h1>
        <CheckoutForm enviando={crearPedido.isPending} onConfirmar={onConfirmar} />
        {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      </Card>
      <Card className="h-fit space-y-2 p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Tu pedido</h2>
        {items.map((i) => (
          <div key={i.producto_id} className="flex justify-between text-sm text-gray-600">
            <span>
              {i.cantidad} × {i.nombre}
            </span>
            <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </div>
        <p className="text-xs text-gray-500">El pago es manual: en efectivo al recibir o por transferencia.</p>
      </Card>
    </section>
  )
}
