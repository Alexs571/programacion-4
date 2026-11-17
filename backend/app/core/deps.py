"""Dependencias de sesión y rol que usan los routers."""
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.config import COOKIE_NAME
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Lee la cookie HttpOnly "access_token". auto_error=False para devolver nuestro propio 401.
# Además hace que /docs muestre el candado en los endpoints con sesión.
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)


def get_current_user(token: Annotated[str | None, Depends(cookie_scheme)]) -> UserPublic:
    """Obtiene el usuario a partir de la cookie. 401 si no hay cookie o el token no sirve."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o vencido")
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o vencido")
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """Rechaza a los usuarios dados de baja (disabled = true)."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Devuelve una dependencia que deja pasar solo a los roles indicados (si no, 403)."""

    def verificar_rol(usuario: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permisos para esta operación")
        return usuario

    return verificar_rol


# Atajos para los routers
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
