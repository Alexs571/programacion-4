# Importo todos los modelos acá para que SQLAlchemy pueda resolver las relaciones
# entre módulos (Usuario <-> Pedido, Producto <-> DetallePedido, etc.).
from app.modules.usuarios.models import Usuario  # noqa: F401
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
