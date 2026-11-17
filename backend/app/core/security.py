from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# passlib con bcrypt (por eso bcrypt queda fijado en 4.0.1)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    """Genera el JWT. En 'sub' va el username del usuario."""
    minutos = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expira = datetime.now(timezone.utc) + timedelta(minutes=minutos)
    payload = {"sub": subject, "exp": expira}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Devuelve el username si la firma es válida y el token no venció; si no, None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    username = payload.get("sub")
    return username if isinstance(username, str) else None
