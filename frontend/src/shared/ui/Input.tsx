import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const claseControl =
  'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'

interface CampoProps {
  id: string
  label: string
  errores?: unknown[]
  children: ReactNode
}

// Etiqueta + control + errores de validación (los errores vienen de TanStack Form)
export function Campo({ id, label, errores = [], children }: CampoProps) {
  // sin repetidos (el mismo validador puede correr en onChange y en onSubmit)
  const mensajes = [...new Set(errores.filter((e): e is string => typeof e === 'string'))]
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {mensajes.length > 0 && <p className="mt-1 text-xs text-red-600">{mensajes.join(', ')}</p>}
    </div>
  )
}

// ancho completo salvo que se pase otro ancho (w-48, w-56...) en className
const ancho = (className: string) => (/\bw-/.test(className) ? '' : 'w-full')

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${claseControl} ${ancho(className)} ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${claseControl} ${ancho(className)} ${className}`} {...props} />
}

export function TextArea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${claseControl} ${ancho(className)} ${className}`} {...props} />
}
