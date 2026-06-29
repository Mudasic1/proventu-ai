from fastapi import APIRouter

from app.api.routes.agents import router as agents_router
from app.api.routes.campaigns import router as campaigns_router
from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router

router = APIRouter()
router.include_router(health_router)
router.include_router(campaigns_router)
router.include_router(chat_router)
router.include_router(agents_router)

__all__ = ["router"]
