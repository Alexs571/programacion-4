import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { formatearPrecio } from '@/shared/utils/formato'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarStock, useEliminarProducto, useGuardarProducto, useProductos } from '../hooks/useProductos'
import type { ProductoCreate, ProductoRead, ProductoStockUpdate } from '../types/producto'

const columnHelper = createColumnHelper<ProductoRead>()
const SIN_DATOS: ProductoRead[] = []

type ModalAbierto = { tipo: 'form'; producto: ProductoRead | null } | { tipo: 'stock'; producto: ProductoRead } | null

export function AdminProductosPage() {
  // el panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const guardar = useGuardarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [modal, setModal] = useState<ModalAbierto>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  function abrir(m: ModalAbierto) {
    setErrorModal(null)
    setModal(m)
  }

  async function onGuardar(datos: ProductoCreate) {
    if (modal?.tipo !== 'form') return
    try {
      await guardar.mutateAsync({ id: modal.producto?.id, datos })
      setMensaje(modal.producto ? 'Producto actualizado' : 'Producto creado')
      setModal(null)
    } catch (e) {
      setErrorModal(handleApiError(e))
    }
  }

  async function onGuardarStock(datos: ProductoStockUpdate) {
    if (modal?.tipo !== 'stock') return
    try {
      await stock.mutateAsync({ id: modal.producto.id, datos })
      setMensaje('Stock actualizado')
      setModal(null)
    } catch (e) {
      setErrorModal(handleApiError(e))
    }
  }

  async function onEliminar(producto: ProductoRead) {
    if (!window.confirm(`¿Dar de baja "${producto.nombre}"?`)) return
    try {
      await eliminar.mutateAsync(producto.id)
      setMensaje('Producto dado de baja')
    } catch (e) {
      setMensaje(handleApiError(e))
    }
  }

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => formatearPrecio(info.getValue()) }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => <span className={info.getValue() === 0 ? 'font-semibold text-red-600' : ''}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) => (info.getValue() ? '✅ Sí' : '⛔ No'),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button tamano="sm" variante="secundario" onClick={() => abrir({ tipo: 'form', producto: row.original })}>
              Editar
            </Button>
            <Button tamano="sm" variante="secundario" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
              Stock
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
    data: data?.items ?? SIN_DATOS,
    columns: columnas,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // que no vuelva a la página 1 cada vez que se refrescan los datos después de una acción
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <div className="flex gap-2">
          <Input placeholder="Filtrar…" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="w-48" aria-label="Filtrar" />
          <Button onClick={() => abrir({ tipo: 'form', producto: null })}>+ Nuevo producto</Button>
        </div>
      </div>
      {mensaje && (
        <p className="mb-3 rounded-md bg-green-50 p-2 text-sm text-green-800" onClick={() => setMensaje(null)}>
          {mensaje}
        </p>
      )}
      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && <DataTable table={table} mensajeVacio="Todavía no hay productos" />}

      <Modal
        abierto={modal?.tipo === 'form'}
        titulo={modal?.tipo === 'form' && modal.producto ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={() => setModal(null)}
      >
        {modal?.tipo === 'form' && (
          <ProductoForm
            key={modal.producto?.id ?? 'nuevo'}
            producto={modal.producto}
            categorias={categorias}
            enviando={guardar.isPending}
            onGuardar={onGuardar}
            onCancelar={() => setModal(null)}
          />
        )}
        {errorModal && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{errorModal}</p>}
      </Modal>

      <Modal abierto={modal?.tipo === 'stock'} titulo="Stock y disponibilidad" onCerrar={() => setModal(null)}>
        {modal?.tipo === 'stock' && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            enviando={stock.isPending}
            onGuardar={onGuardarStock}
            onCancelar={() => setModal(null)}
          />
        )}
        {errorModal && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{errorModal}</p>}
      </Modal>
    </section>
  )
}
