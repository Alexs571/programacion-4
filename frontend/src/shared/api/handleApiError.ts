import axios from 'axios'

interface ErrorValidacion {
  loc?: (string | number)[]
  msg: string
}

// Convierte el error de Axios en un texto para mostrar en pantalla, a partir del "detail" de FastAPI
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. ¿Está levantado el backend?'
    }
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') {
      return detail
    }
    // 422: FastAPI devuelve una lista con los errores de validación
    if (Array.isArray(detail)) {
      return (detail as ErrorValidacion[])
        .map((e) => {
          const campo = e.loc ? e.loc[e.loc.length - 1] : ''
          return campo ? `${campo}: ${e.msg}` : e.msg
        })
        .join(' | ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado'
}
