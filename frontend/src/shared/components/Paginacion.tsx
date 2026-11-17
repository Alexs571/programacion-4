import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  pagina: number // empieza en 0
  totalItems: number
  porPagina: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalItems, porPagina, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina))
  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600">
      <Button variante="secundario" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
        ← Anterior
      </Button>
      <span>
        Página {pagina + 1} de {totalPaginas} · {totalItems} resultados
      </span>
      <Button variante="secundario" onClick={() => onCambiar(pagina + 1)} disabled={pagina + 1 >= totalPaginas}>
        Siguiente →
      </Button>
    </div>
  )
}
