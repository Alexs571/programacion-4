from collections.abc import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work base: una sesión (una transacción) por operación del Service.

    Se usa con `with self.uow as uow:`. Si el bloque termina bien se hace commit;
    si se lanzó una excepción se hace rollback. En los dos casos se cierra la sesión.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self.session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = self._factory()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
