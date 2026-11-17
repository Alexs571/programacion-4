import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido'

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-2 text-gray-600">
        <span>Estado:</span>
        <span>
          <BadgeEstado estado={pedido.estado} />
        </span>
        <span>Fecha:</span>
        <span>{formatearFecha(pedido.created_at)}</span>
        <span>Última actualización:</span>
        <span>{formatearFecha(pedido.updated_at)}</span>
        <span>Forma de pago:</span>
        <span>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</span>
        <span>Dirección:</span>
        <span>{pedido.direccion_entrega}</span>
        {pedido.notas && (
          <>
            <span>Notas:</span>
            <span>{pedido.notas}</span>
          </>
        )}
      </div>
      <table className="w-full text-left">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Precio</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((linea) => (
            <tr key={linea.producto_id} className="border-b border-gray-100">
              <td className="py-1">{linea.nombre_producto}</td>
              <td className="py-1 text-right">{formatearPrecio(linea.precio_unitario)}</td>
              <td className="py-1 text-right">{linea.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(linea.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right text-lg font-bold">Total: {formatearPrecio(pedido.total)}</p>
    </div>
  )
}
