from sqlmodel import SQLModel


class MensajeResponse(SQLModel):
    # el login y el logout responden solo un mensaje: el token nunca viaja en el cuerpo
    message: str
