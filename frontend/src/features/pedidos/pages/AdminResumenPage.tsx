import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useResumenPedidos()

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Resumen del negocio</h1>
        <Button variante="secundario" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} icono="🕒" color="border-yellow-400" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" color="border-blue-400" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} icono="✅" color="border-green-500" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} icono="❌" color="border-red-400" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" color="border-orange-400" />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            icono="💰"
            color="border-emerald-500"
          />
        </div>
      )}
    </section>
  )
}
