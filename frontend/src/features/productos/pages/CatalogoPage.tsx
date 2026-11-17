import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTarjetas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Input, Select } from '@/shared/ui/Input'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('') // lo que se escribe en el buscador
  const [search, setSearch] = useState('') // lo que se busca (al apretar Buscar)
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { data: categorias } = useCategorias()
  // paginación del lado del servidor: skip = página × limit
  const { data, isLoading, isError, error, refetch, isFetching } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  function buscar(e: FormEvent) {
    e.preventDefault()
    setPagina(0)
    setSearch(texto.trim())
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catálogo</h1>
          <p className="text-sm text-gray-500">Elegí tus comidas y armá el pedido</p>
        </div>
        <form onSubmit={buscar} className="flex flex-wrap gap-2">
          <Input
            placeholder="Buscar por nombre…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-56"
            aria-label="Buscar"
          />
          <Select
            aria-label="Categoría"
            value={categoriaId ?? ''}
            onChange={(e) => {
              setPagina(0)
              setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            }}
            className="w-48"
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Button type="submit">Buscar</Button>
        </form>
      </div>

      {isLoading && <SkeletonTarjetas cantidad={POR_PAGINA} />}
      {isError && <EstadoError error={error} onReintentar={() => refetch()} />}
      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="No encontramos productos con esos filtros.">
          <Button
            variante="secundario"
            onClick={() => {
              setTexto('')
              setSearch('')
              setCategoriaId(undefined)
              setPagina(0)
            }}
          >
            Limpiar filtros
          </Button>
        </EstadoVacio>
      )}
      {data && data.items.length > 0 && (
        <>
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalItems={data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
