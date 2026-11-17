import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Select } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const POR_PAGINA = 10

export function MisPedidosPage() {
  const location = useLocation()
  const recienCreado = (location.state as { creado?: boolean } | null)?.creado === true
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(recienCreado ? '¡Pedido confirmado! Lo vas a ver acá abajo.' : null)

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, estado })
  const detalle = usePedido(detalleId)
  const cancelar = useCancelarPedido()

  async function onCancelar(pedido: Pedido) {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) return
    try {
      await cancelar.mutateAsync(pedido.id)
      setMensaje(`Pedido #${pedido.id} cancelado. El stock se devolvió al catálogo.`)
    } catch (e) {
      setMensaje(handleApiError(e))
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Mis pedidos</h1>
        <Select
          aria-label="Filtrar por estado"
          className="w-52"
          value={estado ?? ''}
          onChange={(e) => {
            setPagina(0)
            setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
      </div>
      {mensaje && (
        <p className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-800" onClick={() => setMensaje(null)}>
          {mensaje}
        </p>
      )}

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="Todavía no tenés pedidos.">
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      )}
      {data && data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {data.items.map((pedido) => (
              <Card key={pedido.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    Pedido #{pedido.id} <BadgeEstado estado={pedido.estado} />
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatearFecha(pedido.created_at)} · {pedido.items.length} producto(s) · {pedido.direccion_entrega}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-lg font-bold">{formatearPrecio(pedido.total)}</span>
                  <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {/* el cliente solo puede cancelar en PENDIENTE */}
                  {pedido.estado === 'PENDIENTE' && (
                    <Button variante="peligro" tamano="sm" disabled={cancelar.isPending} onClick={() => onCancelar(pedido)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalItems={data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={detalleId !== null} titulo={`Pedido #${detalleId ?? ''}`} onCerrar={() => setDetalleId(null)}>
        {detalle.isLoading && <SkeletonFilas filas={4} />}
        {detalle.isError && <EstadoError error={detalle.error} />}
        {detalle.data && <PedidoDetalle pedido={detalle.data} />}
      </Modal>
    </section>
  )
}
