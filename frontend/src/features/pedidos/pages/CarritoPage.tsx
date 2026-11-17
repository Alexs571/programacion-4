import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-medium text-orange-700 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Carrito</h1>
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex flex-wrap items-center gap-4">
              {item.imagen_url ? (
                <img src={item.imagen_url} alt={item.nombre} className="h-16 w-16 rounded-md object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-orange-50 text-2xl">🍽️</div>
              )}
              <div className="min-w-40 flex-1">
                <p className="font-semibold text-gray-800">{item.nombre}</p>
                <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variante="secundario" tamano="sm" aria-label="Restar" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                  −
                </Button>
                <span className="w-8 text-center font-medium" data-testid={`cantidad-${item.producto_id}`}>
                  {item.cantidad}
                </span>
                <Button
                  variante="secundario"
                  tamano="sm"
                  aria-label="Sumar"
                  disabled={item.cantidad >= item.stock}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
              <Button variante="peligro" tamano="sm" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Card className="h-fit space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Resumen</h2>
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
        <Button className="w-full" onClick={() => navigate('/checkout')}>
          Confirmar pedido
        </Button>
        <Button variante="secundario" className="w-full" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </Card>
    </section>
  )
}
