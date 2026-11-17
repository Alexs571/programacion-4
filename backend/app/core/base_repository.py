from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones comunes a todas las tablas. Sin reglas de negocio y sin commit."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[T]:
        consulta = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(consulta).all())

    def add(self, objeto: T) -> T:
        # flush para que la base asigne el id sin cerrar la transacción
        self.session.add(objeto)
        self.session.flush()
        self.session.refresh(objeto)
        return objeto

    def delete(self, objeto: T) -> None:
        # borrado físico: en este proyecto casi no se usa porque hay baja lógica
        self.session.delete(objeto)
        self.session.flush()
