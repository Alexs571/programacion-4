import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'exito'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: 'sm' | 'md'
}

const estilos: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  exito: 'bg-green-600 text-white hover:bg-green-700',
}

export function Button({ variante = 'primario', tamano = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  const medida = tamano === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      className={`rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${medida} ${estilos[variante]} ${className}`}
      {...props}
    />
  )
}
