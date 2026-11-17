import { useState } from 'react'
import { formatearPrecio } from '@/shared/utils/formato'
import { Button } from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'
import type { ProductoRead } from '../types/producto'

interface ProductoCardProps {
  producto: ProductoRead
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  const puedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-40 w-full object-cover"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-5xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 text-xs font-medium uppercase text-orange-700">{producto.categoria.nombre}</span>
        <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{producto.descripcion}</p>}
        <div className="mt-auto pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">{formatearPrecio(producto.precio_base)}</span>
            <span className={`text-xs ${sinStock || !producto.disponible ? 'text-red-600' : 'text-gray-500'}`}>
              {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </span>
          </div>
          <Button className="w-full" disabled={!puedeAgregar} onClick={() => agregar(producto)}>
            {enCarrito > 0 ? `Agregar al carrito (${enCarrito})` : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </article>
  )
}
