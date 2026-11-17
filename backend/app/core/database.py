from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este parámetro para usarse desde varios hilos (solo desarrollo)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def create_all_tables() -> None:
    """Crea las tablas que todavía no existen."""
    # importo los modelos para que queden registrados en SQLModel.metadata
    import app.modules  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Devuelve una sesión nueva. La usa el Unit of Work (que es quien hace commit y close)."""
    return Session(engine)
