import { useState } from 'react'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Select } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { TablaPedidos } from '../components/TablaPedidos'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const POR_PAGINA = 10

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, estado })
  const { data: usuarios } = useUsuarios()
  const cambiarEstado = useCambiarEstadoPedido()

  function nombreUsuario(id: number): string {
    return usuarios?.find((u) => u.id === id)?.username ?? `Usuario #${id}`
  }

  async function onCambiarEstado(pedido: Pedido, nuevo: EstadoPedido) {
    if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock.`)) return
    try {
      const actualizado = await cambiarEstado.mutateAsync({ id: pedido.id, estado: nuevo })
      setMensaje({ texto: `Pedido #${actualizado.id} → ${actualizado.estado}`, error: false })
    } catch (e) {
      setMensaje({ texto: handleApiError(e), error: true })
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
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
        <p
          className={`mb-3 rounded-md p-2 text-sm ${mensaje.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}
          onClick={() => setMensaje(null)}
        >
          {mensaje.texto}
        </p>
      )}
      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && (
        <>
          <TablaPedidos
            pedidos={data.items}
            nombreUsuario={nombreUsuario}
            ocupado={cambiarEstado.isPending}
            onVer={setSeleccionado}
            onCambiarEstado={onCambiarEstado}
          />
          <Paginacion pagina={pagina} totalItems={data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}

      <Modal abierto={seleccionado !== null} titulo={`Pedido #${seleccionado?.id ?? ''} · ${seleccionado ? nombreUsuario(seleccionado.usuario_id) : ''}`} onCerrar={() => setSeleccionado(null)}>
        {seleccionado && <PedidoDetalle pedido={seleccionado} />}
      </Modal>
    </section>
  )
}
