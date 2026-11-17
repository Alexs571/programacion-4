import { api } from '@/shared/api/axiosInstance'
import type { CategoriaCreate, CategoriaRead, CategoriaUpdate } from '../types/categoria'

export async function getCategorias(): Promise<CategoriaRead[]> {
  const { data } = await api.get<CategoriaRead[]>('/categorias')
  return data
}

export async function crearCategoria(datos: CategoriaCreate): Promise<CategoriaRead> {
  const { data } = await api.post<CategoriaRead>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: CategoriaUpdate): Promise<CategoriaRead> {
  const { data } = await api.put<CategoriaRead>(`/categorias/${id}`, datos)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
