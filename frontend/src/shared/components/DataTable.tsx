import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/shared/ui/Button'

interface DataTableProps<T> {
  table: Table<T>
  mensajeVacio?: string
}

// Dibuja una tabla de TanStack Table (la instancia la arma cada página con useReactTable).
// Si la tabla tiene getPaginationRowModel muestra los controles de paginación del lado del cliente.
export function DataTable<T>({ table, mensajeVacio = 'No hay registros' }: DataTableProps<T>) {
  const filas = table.getRowModel().rows
  const columnas = table.getAllLeafColumns().length
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          {table.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => {
                const orden = header.column.getIsSorted()
                return (
                  <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-orange-700"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="text-xs">{orden === 'asc' ? '▲' : orden === 'desc' ? '▼' : '↕'}</span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas} className="px-4 py-8 text-center text-gray-500">
                {mensajeVacio}
              </td>
            </tr>
          )}
          {filas.map((fila) => (
            <tr key={fila.id} className="border-t border-gray-100 hover:bg-orange-50/40">
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="px-4 py-3 align-middle text-gray-700">
                  {flexRender(celda.column.columnDef.cell, celda.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-sm text-gray-600">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
