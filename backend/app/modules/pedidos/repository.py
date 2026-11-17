from datetime import datetime

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listar(self, condiciones: list, skip: int, limit: int) -> tuple[int, list[Pedido]]:
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        consulta = select(Pedido).where(*condiciones).order_by(Pedido.id.desc()).offset(skip).limit(limit)
        return total, list(self.session.exec(consulta).all())

    def list_by_usuario(
        self, usuario_id: int, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, list[Pedido]]:
        """Pedidos de un usuario (los más nuevos primero). Devuelve (total, items)."""
        condiciones = [Pedido.usuario_id == usuario_id]
        if estado:
            condiciones.append(Pedido.estado == estado)
        return self._listar(condiciones, skip, limit)

    def list_todos(self, estado: str | None = None, skip: int = 0, limit: int = 20) -> tuple[int, list[Pedido]]:
        """Todos los pedidos (para el admin)."""
        condiciones = [Pedido.estado == estado] if estado else []
        return self._listar(condiciones, skip, limit)

    def count_by_estado(self, estado: str) -> int:
        consulta = select(func.count(Pedido.id)).where(Pedido.estado == estado)
        return self.session.exec(consulta).one()

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count(Pedido.id)).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_by_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(consulta).one())
