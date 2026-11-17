import { Card } from '@/shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  icono: string
  color: string // clases de Tailwind para el borde
}

export function TarjetaResumen({ titulo, valor, icono, color }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">{valor}</p>
        </div>
        <span className="text-4xl">{icono}</span>
      </div>
    </Card>
  )
}
