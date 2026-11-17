import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  children?: ReactNode
}

export function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
      <p className="mb-3 text-3xl">🍽️</p>
      <p>{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
