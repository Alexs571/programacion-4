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
import { useAuthStore } from '@/store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { UserPublic } from '../types/usuario'

const columnHelper = createColumnHelper<UserPublic>()
const SIN_DATOS: UserPublic[] = []

export function AdminUsuariosPage() {
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const idSesion = useAuthStore((s) => s.usuario?.id)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const columnas = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Usuario' }),
      columnHelper.accessor('full_name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${info.getValue() === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? <span className="text-red-600">Desactivado</span> : <span className="text-green-700">Activo</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          return (
            <div className="flex gap-1">
              {u.disabled && (
                <Button tamano="sm" variante="exito" onClick={() => onCambiar(u, true)}>
                  Activar
                </Button>
              )}
              {/* el admin no puede desactivarse a sí mismo: no se muestra el botón en su fila */}
              {!u.disabled && u.id !== idSesion && (
                <Button tamano="sm" variante="peligro" onClick={() => onCambiar(u, false)}>
                  Desactivar
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    // se rearman si cambia el usuario de la sesión
    [idSesion],
  )

  async function onCambiar(usuario: UserPublic, activar: boolean) {
    try {
      await cambiarEstado.mutateAsync({ id: usuario.id, activar })
      setMensaje(`${usuario.username} ${activar ? 'activado' : 'desactivado'}`)
    } catch (e) {
      setMensaje(handleApiError(e))
    }
  }

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
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Usuarios</h1>
      {mensaje && (
        <p className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-800" onClick={() => setMensaje(null)}>
          {mensaje}
        </p>
      )}
      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && <DataTable table={table} mensajeVacio="No hay usuarios" />}
    </section>
  )
}
