from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_id_para_actualizar(self, producto_id: int) -> Producto | None:
        # SELECT ... FOR UPDATE: bloquea la fila hasta el commit para que dos pedidos
        # simultáneos no descuenten el mismo stock (en SQLite se ignora)
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Producto]]:
        """Listado paginado de productos activos con búsqueda y filtros. Devuelve (total, items)."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if nombre:
            condiciones.append(Producto.nombre.ilike(f"%{nombre.strip()}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        consulta = select(Producto).where(*condiciones).order_by(Producto.id).offset(skip).limit(limit)
        return total, list(self.session.exec(consulta).all())
