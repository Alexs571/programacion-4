from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    # PENDIENTE, EN_PREPARACION, ENTREGADO o CANCELADO
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    # EFECTIVO o TRANSFERENCIA
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None)
    # suma de los subtotales; se calcula al crear y no cambia más (RN-05)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # composición: las líneas pertenecen al pedido
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "DetallePedido.id"},
    )


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(ge=1)
    # copia del nombre y del precio al momento de la compra (la línea es inmutable)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
