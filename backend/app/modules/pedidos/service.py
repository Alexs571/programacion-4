from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# Mapa de transiciones de la máquina de estados (RN-02).
# ENTREGADO y CANCELADO son terminales: no admiten cambios.
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


# ---- Excepciones de dominio (el router las traduce a 404 / 403 / 400) ----
class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"No existe el pedido con id {pedido_id}")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    """Base de las reglas que responden 400."""


class PedidoSinItems(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("El pedido tiene que tener al menos un ítem")


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se pueden cancelar pedidos en PENDIENTE (este está en {estado})")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear pedido ----------
    def crear(self, datos: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            if not datos.items:
                raise PedidoSinItems()
            vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            # nace en PENDIENTE con total 0; el total se calcula abajo
            pedido = Pedido(
                usuario_id=usuario.id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=datos.forma_pago.value,
                direccion_entrega=datos.direccion_entrega.strip(),
                notas=datos.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                # en la misma iteración: verifico, descuento stock y creo la línea
                producto = uow.productos.get_by_id_para_actualizar(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia: si después cambia el producto, la línea no cambia
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.flush()
            return PedidoRead.model_validate(pedido)
        # si algo falla, el __exit__ del Unit of Work hace rollback: no queda ni el pedido ni el descuento

    # ---------- listados y detalle (RN-04) ----------
    def listar(self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int) -> PedidosPaginados:
        valor_estado = estado.value if estado else None
        with self.uow as uow:
            if usuario.role == "admin":
                total, pedidos = uow.pedidos.list_todos(valor_estado, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, valor_estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ---------- RN-02 / RN-03: cambio de estado (admin) ----------
    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)
            # la transición se valida antes de tocar el pedido
            if nuevo not in TRANSICIONES[actual]:
                raise TransicionInvalida(actual.value, nuevo.value)
            if nuevo == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo.value
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------- RN-03 / RN-04: cancelación por el dueño ----------
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise PedidoNoCancelable(pedido.estado)
            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = datetime.now()
            uow.session.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------- resumen del panel ----------
    def resumen(self) -> ResumenPedidos:
        inicio_hoy = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(EstadoPedido.PENDIENTE.value),
                en_preparacion=uow.pedidos.count_by_estado(EstadoPedido.EN_PREPARACION.value),
                entregados=uow.pedidos.count_by_estado(EstadoPedido.ENTREGADO.value),
                cancelados=uow.pedidos.count_by_estado(EstadoPedido.CANCELADO.value),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(EstadoPedido.ENTREGADO.value), 2),
            )

    # ---------- auxiliares ----------
    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # se devuelve el stock de cada línea en la misma transacción que cambia el estado
        for linea in pedido.items:
            producto = uow.productos.get_by_id_para_actualizar(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.session.add(producto)
