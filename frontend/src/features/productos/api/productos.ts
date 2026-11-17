import { api } from '@/shared/api/axiosInstance'
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoRead,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // los filtros vacíos no se mandan
  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await api.get<ProductosPaginados>('/productos', { params })
  return data
}

export async function getProducto(id: number): Promise<ProductoRead> {
  const { data } = await api.get<ProductoRead>(`/productos/${id}`)
  return data
}

export async function crearProducto(datos: ProductoCreate): Promise<ProductoRead> {
  const { data } = await api.post<ProductoRead>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<ProductoRead> {
  const { data } = await api.put<ProductoRead>(`/productos/${id}`, datos)
  return data
}

export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<ProductoRead> {
  const { data } = await api.patch<ProductoRead>(`/productos/${id}/stock`, datos)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
