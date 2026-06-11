from functools import lru_cache

from fastapi import Header, HTTPException, status

from app.config import get_settings
from app.repositories import PostgresAiRunRepository
from app.services import CampaignPlanService, GoogleCampaignPlanGenerator


def require_internal_secret(x_ai_backend_secret: str = Header(default="")) -> None:
    settings = get_settings()
    if x_ai_backend_secret != settings.ai_backend_shared_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Internal AI service authentication failed.",
        )


@lru_cache
def get_campaign_plan_service() -> CampaignPlanService:
    settings = get_settings()
    return CampaignPlanService(
        repository=PostgresAiRunRepository(settings.database_uri),
        generator=GoogleCampaignPlanGenerator(
            api_key=settings.google_api_key,
            model=settings.google_model,
        ),
        model=settings.google_model,
    )
