"""Carga datos iniciales: usuario admin, categorías y productos.

Se ejecuta con:  python -m app.db.seed
Es idempotente: si un registro ya existe no lo vuelve a crear (se puede correr varias veces).
"""
from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Pizzas", "Pizzas a la piedra de 8 porciones"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para el final"),
]

# (categoría, nombre, descripción, precio, stock, imagen)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Medallón de carne, lechuga, tomate y queso", 7500.0, 25,
     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble medallón, cheddar y panceta", 9800.0, 15,
     "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600"),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9000.0, 20,
     "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 10500.0, 12,
     "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600"),
    ("Empanadas", "Empanada de carne", "Carne cortada a cuchillo", 1500.0, 60,
     "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600"),
    ("Empanadas", "Empanada de jamón y queso", "Jamón cocido y muzzarella", 1400.0, 60,
     "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600"),
    ("Bebidas", "Gaseosa cola 1,5 L", "Botella de 1,5 litros", 3200.0, 40,
     "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600"),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1500.0, 50,
     "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600"),
    ("Postres", "Flan casero", "Con dulce de leche o crema", 3500.0, 10,
     "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600"),
    ("Postres", "Brownie con helado", "Brownie tibio con una bocha de helado", 4800.0, 8,
     "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600"),
]


def seed() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        s = uow.session

        # admin
        if s.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            s.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print("Usuario admin creado")
        else:
            print("El usuario admin ya existía")

        # categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = s.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                s.add(categoria)
                s.flush()
            categorias[nombre] = categoria

        # productos (se identifican por el nombre)
        creados = 0
        for cat, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            if s.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                s.add(
                    Producto(
                        categoria_id=categorias[cat].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen,
                    )
                )
                creados += 1
        print(f"Categorías: {len(categorias)} | productos nuevos: {creados}")
    print("Seed terminado")


if __name__ == "__main__":
    seed()
