from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import API_PREFIX, settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # al arrancar creo las tablas que falten (el seed también lo hace)
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description=(
        "TPI de Programación 4 - Alexis da Silva. API de pedidos de comida con FastAPI + SQLModel.\n\n"
        "Para probar los endpoints con sesión desde /docs: ejecutar primero **POST /api/v1/auth/token** "
        "(la cookie HttpOnly queda guardada en el navegador y se manda sola en las siguientes llamadas)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador solo manda la cookie si el origen está permitido explícitamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(router, prefix=API_PREFIX)


@app.get("/", tags=["Inicio"])
def inicio():
    return {"message": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
