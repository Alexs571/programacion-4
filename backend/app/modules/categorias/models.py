from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=100)
    descripcion: str | None = Field(default=None)
    # baja lógica: no libera el nombre ni oculta los productos
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
