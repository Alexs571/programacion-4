import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    // mientras carga la página siguiente se sigue viendo la anterior
    placeholderData: keepPreviousData,
  })
}

export function useGuardarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id?: number; datos: ProductoCreate }) =>
      id ? actualizarProducto(id, datos) : crearProducto(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => actualizarStock(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  })
}
