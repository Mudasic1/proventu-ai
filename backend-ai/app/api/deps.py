"""
FastAPI dependency providers — called once at startup via lru_cache.
"""

from functools import lru_cache

from fastapi import Header, HTTPException, status

from app.core.config import get_settings
from app.services.agent_runner import AgentRunner
from app.services.campaigns import CampaignPlanService, make_campaign_plan_service


def require_internal_secret(x_ai_backend_secret: str = Header(default="")) -> None:
    """Validate the internal shared secret on every request."""
    settings = get_settings()
    if x_ai_backend_secret != settings.ai_backend_shared_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Internal AI service authentication failed.",
        )


@lru_cache
def get_campaign_plan_service() -> CampaignPlanService:
    """Return a cached CampaignPlanService (SDK-backed)."""
    settings = get_settings()
    return make_campaign_plan_service(
        database_uri=settings.database_uri,
        model=settings.google_model,
    )


@lru_cache
def get_agent_runner() -> AgentRunner:
    """Return a cached AgentRunner (singleton, thread-safe)."""
    return AgentRunner()
