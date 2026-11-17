import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'
import type { CategoriaCreate, CategoriaRead } from '../types/categoria'

const columnHelper = createColumnHelper<CategoriaRead>()
const SIN_DATOS: CategoriaRead[] = []

export function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias()
  const guardar = useGuardarCategoria()
  const eliminar = useEliminarCategoria()

  // undefined = modal cerrado, null = alta, objeto = edición
  const [editando, setEditando] = useState<CategoriaRead | null | undefined>(undefined)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  function abrir(categoria: CategoriaRead | null) {
    setErrorModal(null)
    setEditando(categoria)
  }

  async function onGuardar(datos: CategoriaCreate) {
    try {
      await guardar.mutateAsync({ id: editando?.id, datos })
      setMensaje(editando ? 'Categoría actualizada' : 'Categoría creada')
      setEditando(undefined)
    } catch (e) {
      // por ejemplo 409 nombre duplicado: se muestra sin cerrar el modal
      setErrorModal(handleApiError(e))
    }
  }

  async function onEliminar(categoria: CategoriaRead) {
    if (!window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"? Sus productos siguen visibles hasta que los des de baja.`)) return
    try {
      await eliminar.mutateAsync(categoria.id)
      setMensaje('Categoría dada de baja')
    } catch (e) {
      setMensaje(handleApiError(e))
    }
  }

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('descripcion', { header: 'Descripción', cell: (info) => info.getValue() ?? '—', enableSorting: false }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button tamano="sm" variante="secundario" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button tamano="sm" variante="peligro" onClick={() => onEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    // las columnas se arman una sola vez (las acciones usan setters y mutaciones estables)
    [],
  )

  const table = useReactTable({
    data: data ?? SIN_DATOS,
    columns: columnas,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // que no vuelva a la página 1 cada vez que se refrescan los datos después de una acción
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </div>
      {mensaje && (
        <p className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-800" onClick={() => setMensaje(null)}>
          {mensaje}
        </p>
      )}
      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && <DataTable table={table} mensajeVacio="Todavía no hay categorías" />}

      <Modal abierto={editando !== undefined} titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onCerrar={() => setEditando(undefined)}>
        {editando !== undefined && (
          <CategoriaForm
            key={editando?.id ?? 'nueva'}
            categoria={editando}
            enviando={guardar.isPending}
            onGuardar={onGuardar}
            onCancelar={() => setEditando(undefined)}
          />
        )}
        {errorModal && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{errorModal}</p>}
      </Modal>
    </section>
  )
}
