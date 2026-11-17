# Food Store · TPI Programación 4

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia, UTN).

- **Alumno:** Alexis da Silva
- **Repositorio:** `⚠️ PEGAR ACÁ LA URL DEL REPOSITORIO PÚBLICO DE GITHUB` <!-- ej: https://github.com/usuario/food-store-tpi -->
- **Video de demostración (10 a 15 min):** `⚠️ PEGAR ACÁ EL LINK PÚBLICO DEL VIDEO` <!-- YouTube no listado o Drive con acceso público -->

Food Store es una aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago (efectivo o transferencia). El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

| Parte | Tecnologías |
|-------|-------------|
| `backend/` | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose), passlib + bcrypt, arquitectura en capas con Unit of Work |
| `frontend/` | React 19 + TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router 7 |

---

## 1. Requisitos

| Herramienta | Versión |
|-------------|---------|
| Python | 3.11, 3.12 o 3.13 (**no** 3.14: SQLModel no funciona) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

Antes de arrancar hay que crear una base de datos **vacía** en PostgreSQL (las tablas las crea el backend):

```sql
CREATE DATABASE foodstore_db;
```

(con psql: `psql -U postgres -c "CREATE DATABASE foodstore_db;"`, o desde pgAdmin).

---

## 2. Backend

Todos los comandos se ejecutan **dentro de la carpeta `backend/`**.

### 2.1 Instalación

```bash
cd backend
python -m venv .venv

# activar el entorno virtual
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (cmd):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2.2 Variables de entorno

Copiar `.env.example` a `.env` y completar los datos de tu PostgreSQL:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (**mínimo 32 caracteres**) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie (minutos) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |

> Para una prueba rápida sin PostgreSQL se puede usar `DATABASE_URL=sqlite:///./foodstore.db`.

### 2.3 Datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga el usuario administrador, 5 categorías y 10 productos con stock e imagen. Es **idempotente**: se puede correr varias veces sin duplicar datos.

### 2.4 Ejecución

```bash
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación Swagger: <http://localhost:8000/docs>
- Documentación ReDoc: <http://localhost:8000/redoc>

**Probar desde `/docs` con sesión:** ejecutar primero `POST /api/v1/auth/token` con usuario y contraseña. La cookie HttpOnly queda guardada en el navegador y se manda sola en las siguientes llamadas (los endpoints con candado la usan). `POST /api/v1/auth/logout` la borra.

**Archivo de pruebas:** `backend/food_store.http` tiene una petición para cada endpoint con el código de respuesta esperado (registro, login, catálogo, pedidos, reglas de negocio, errores 400/401/403/404/409/422 y bajas lógicas). Se ejecuta en orden con la extensión *REST Client* de VS Code, con el backend levantado y el seed cargado.

---

## 3. Frontend

Todos los comandos se ejecutan **dentro de la carpeta `frontend/`**, con el backend corriendo.

### 3.1 Variables de entorno

Copiar `.env.example` a `.env`:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

### 3.2 Instalación y ejecución

```bash
cd frontend
pnpm install
pnpm build   # verifica los tipos (tsc) y genera dist/
pnpm dev     # servidor de desarrollo en http://localhost:5173
```

Abrir <http://localhost:5173>. El frontend tiene que correr en ese origen porque es el que está permitido en `FRONTEND_ORIGIN`.

---

## 4. Usuarios para probar

| Rol | Usuario | Contraseña | Cómo se obtiene |
|-----|---------|------------|-----------------|
| `admin` | `admin` | `Admin1234!` | Lo crea `python -m app.db.seed` |
| `user` | el que registres | la que elijas (mínimo 8 caracteres) | Registro público en `/register` (siempre crea rol `user`) |

---

## 5. Funcionalidades

**Cliente (rol `user`)**
- Registro e inicio de sesión (TanStack Form con validaciones). La sesión viaja en una cookie HttpOnly: el frontend nunca lee ni guarda el token.
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría, skeleton mientras carga y estado vacío.
- Carrito persistido en el navegador (Zustand + persist): cantidades, subtotales y total.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- «Mis pedidos» con filtro por estado, detalle con sus líneas y cancelación solo en `PENDIENTE` (devuelve el stock).

**Administrador (rol `admin`)**
- Resumen con tarjetas: pendientes, en preparación, entregados, cancelados, pedidos de hoy e ingresos de los entregados.
- ABM de categorías y productos con TanStack Table y TanStack Form, incluido el cambio de stock y disponibilidad. Las bajas son lógicas.
- Gestión de pedidos con filtro por estado y botones según la máquina de estados (`PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los dos primeros).
- Gestión de usuarios: activar y desactivar (el admin no puede desactivarse a sí mismo).

**Reglas de negocio (backend)**
- **RN-01** El pedido se crea en una sola transacción: sin productos repetidos; cada producto tiene que existir, estar activo, disponible y con stock. Se descuenta el stock y se copia el nombre y el precio en cada línea. Si algo falla no se guarda nada.
- **RN-02** Solo las transiciones de la máquina de estados; los estados terminales no cambian (400).
- **RN-03** Cancelar devuelve el stock en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos (403 si es ajeno); el admin ve todos.
- **RN-05** Las líneas y el total no cambian: no hay endpoints para editar ni borrar pedidos.
- **RN-06** `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`} y `direccion_entrega` de 5 a 200 caracteres (422).

---

## 6. Endpoints (prefijo `/api/v1`)

| Método | Endpoint | Acceso |
|--------|----------|--------|
| POST | `/auth/register` | Público |
| POST | `/auth/token` | Público (formulario OAuth2; deja la cookie) |
| POST | `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` | admin |
| POST | `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos?skip&limit&search&categoria_id&disponible` · `/productos/{id}` | Público |
| POST · PUT · DELETE | `/productos` · `/productos/{id}` | admin |
| PATCH | `/productos/{id}/stock` | admin |
| POST | `/pedidos` | Sesión |
| GET | `/pedidos?skip&limit&estado` | Sesión (user: los suyos; admin: todos) |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

---

## 7. Estructura del proyecto

```
backend/
├── app/
│   ├── main.py              # FastAPI, CORS con credenciales y routers con prefijo /api/v1
│   ├── core/                # config, database, security, deps, unit_of_work, base_repository
│   ├── modules/             # un paquete por dominio
│   │   ├── auth/            # router, service, schemas
│   │   ├── usuarios/        # models, schemas, repository, unit_of_work, service, router
│   │   ├── categorias/      # misma cadena de archivos
│   │   ├── productos/       # misma cadena de archivos
│   │   └── pedidos/         # misma cadena + máquina de estados y reglas RN-01 a RN-06
│   └── db/seed.py           # admin, categorías y productos (idempotente)
├── food_store.http          # pruebas de todos los endpoints
├── requirements.txt         # versiones fijadas
└── .env.example
frontend/
├── src/
│   ├── shared/              # api (axiosInstance, handleApiError, queryClient), ui, components, layout
│   ├── features/            # auth, categorias, productos, usuarios, pedidos (pages, components, hooks, api, types)
│   ├── store/               # authStore y cartStore (Zustand + persist)
│   ├── routes/              # AppRouter y ProtectedRoute
│   ├── App.tsx              # checkSession al montar
│   └── main.tsx             # QueryClientProvider
├── package.json             # versiones fijadas
└── .env.example
```

---

## 8. Problemas comunes

- **`password authentication failed` o `database "foodstore_db" does not exist`:** revisar usuario, contraseña y nombre de la base en `DATABASE_URL`, y que la base esté creada.
- **La app no arranca y menciona `SECRET_KEY`:** la clave del `.env` tiene que tener al menos 32 caracteres.
- **El login funciona en `/docs` pero no en el frontend:** el frontend tiene que abrirse en `http://localhost:5173` (el mismo valor que `FRONTEND_ORIGIN`) y `VITE_API_URL` tiene que apuntar a `http://localhost:8000/api/v1`. Si cambiás el `.env` del frontend, reiniciá `pnpm dev`.
- **Error de bcrypt al iniciar sesión:** instalar exactamente las versiones de `requirements.txt` (`passlib[bcrypt]==1.7.4` y `bcrypt==4.0.1`).
