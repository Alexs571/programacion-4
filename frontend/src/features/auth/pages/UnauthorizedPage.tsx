import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="mb-2 text-4xl">🚫</p>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Sin permiso</h1>
      <p className="mb-4 text-gray-600">No tenés permisos para ver esta página.</p>
      <Link to="/" className="font-medium text-orange-700 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}
