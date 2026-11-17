import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/DataTable'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { TRANSICIONES } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

interface TablaPedidosProps {
  pedidos: Pedido[]
  nombreUsuario: (usuarioId: number) => string
  ocupado: boolean
  onVer: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

const textoBoton: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

const columnHelper = createColumnHelper<Pedido>()

// Tabla de pedidos del admin: la paginación es del servidor (la maneja la página)
export function TablaPedidos({ pedidos, nombreUsuario, ocupado, onVer, onCambiarEstado }: TablaPedidosProps) {
  const columnas = [
    columnHelper.accessor('id', { header: '#' }),
    columnHelper.accessor('usuario_id', { header: 'Cliente', cell: (info) => nombreUsuario(info.getValue()) }),
    columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columnHelper.accessor('forma_pago', { header: 'Pago' }),
    columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearPrecio(info.getValue()) }),
    columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const pedido = row.original
        return (
          <div className="flex flex-wrap gap-1">
            <Button tamano="sm" variante="secundario" onClick={() => onVer(pedido)}>
              Ver
            </Button>
            {/* solo los botones que permite la máquina de estados */}
            {TRANSICIONES[pedido.estado].map((destino) => (
              <Button
                key={destino}
                tamano="sm"
                variante={destino === 'CANCELADO' ? 'peligro' : destino === 'ENTREGADO' ? 'exito' : 'primario'}
                disabled={ocupado}
                onClick={() => onCambiarEstado(pedido, destino)}
              >
                {textoBoton[destino]}
              </Button>
            ))}
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: pedidos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false, // el orden lo da el backend (los más nuevos primero)
  })
  return <DataTable table={table} mensajeVacio="No hay pedidos con ese filtro" />
}
