// Validaciones reutilizadas por los formularios de TanStack Form.
// Devuelven el mensaje de error o undefined si el valor es válido.

export const requerido = (valor: string) => (valor.trim() ? undefined : 'Este campo es obligatorio')

export const largo = (min: number, max: number) => (valor: string) => {
  const n = valor.trim().length
  if (n < min) return `Mínimo ${min} caracteres`
  if (n > max) return `Máximo ${max} caracteres`
  return undefined
}

export const emailValido = (valor: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ? undefined : 'Email inválido'

export const numeroMinimo = (min: number) => (valor: number) =>
  Number.isNaN(valor) ? 'Ingresá un número' : valor < min ? `Tiene que ser mayor o igual a ${min}` : undefined
