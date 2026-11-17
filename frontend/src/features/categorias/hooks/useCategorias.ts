import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { CategoriaCreate } from '../types/categoria'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
}

export function useGuardarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    // si viene id es edición (PUT); si no, alta (POST)
    mutationFn: ({ id, datos }: { id?: number; datos: CategoriaCreate }) =>
      id ? actualizarCategoria(id, datos) : crearCategoria(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      // los productos muestran el nombre de su categoría
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
