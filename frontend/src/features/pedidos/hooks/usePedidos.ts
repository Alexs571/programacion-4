import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido'

// Un pedido nuevo o cancelado cambia el stock: invalido pedidos, resumen y productos
function invalidarTodo(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['pedidos'] })
  queryClient.invalidateQueries({ queryKey: ['resumen'] })
  queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedidos', 'detalle', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: () => invalidarTodo(queryClient),
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => invalidarTodo(queryClient),
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => invalidarTodo(queryClient),
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen'], queryFn: getResumenPedidos })
}
