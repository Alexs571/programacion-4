import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-orange-50 hover:bg-white/10'}`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.cantidadItems())
  const navigate = useNavigate()
  const esAdmin = usuario?.role === 'admin'

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-orange-600 shadow">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-white">
          🍔 Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{cantidad > 0 && <span className="ml-1 rounded-full bg-white px-1.5 text-xs text-orange-700">{cantidad}</span>}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {/* el panel solo se muestra al admin (el backend igual lo protege con require_role) */}
          {esAdmin && (
            <>
              <span className="mx-1 h-5 w-px bg-white/40" />
              <NavLink to="/admin/resumen" className={claseLink}>Resumen</NavLink>
              <NavLink to="/admin/categorias" className={claseLink}>Categorías</NavLink>
              <NavLink to="/admin/productos" className={claseLink}>Productos</NavLink>
              <NavLink to="/admin/pedidos" className={claseLink}>Pedidos</NavLink>
              <NavLink to="/admin/usuarios" className={claseLink}>Usuarios</NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-white">
          {usuario ? (
            <>
              <span>
                {usuario.full_name}
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs uppercase">{usuario.role}</span>
              </span>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-md border border-white/60 px-3 py-1 hover:bg-white/10"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>Iniciar sesión</NavLink>
              <NavLink to="/register" className={claseLink}>Registrarse</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
