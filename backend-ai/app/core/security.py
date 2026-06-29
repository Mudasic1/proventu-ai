from fastapi import Header, HTTPException, status

from app.core.config import get_settings


def require_internal_secret(x_ai_backend_secret: str = Header(default="")) -> None:
    settings = get_settings()
    if x_ai_backend_secret != settings.ai_backend_shared_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Internal AI service authentication failed.",
        )
