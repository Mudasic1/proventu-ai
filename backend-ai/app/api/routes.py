import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_campaign_plan_service, require_internal_secret
from app.schemas import CampaignPlanRequest, CampaignPlanResponse
from app.services import CampaignPlanService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post(
    "/v1/campaign-plans",
    response_model=CampaignPlanResponse,
    dependencies=[Depends(require_internal_secret)],
)
def create_campaign_plan(
    request: CampaignPlanRequest,
    service: CampaignPlanService = Depends(get_campaign_plan_service),
) -> CampaignPlanResponse:
    try:
        return service.create_plan(request)
    except RuntimeError as error:
        logger.warning(
            "Campaign plan request failed safely.",
            extra={"workspace_id": str(request.workspace_id), "campaign_id": str(request.campaign_id)},
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Campaign planning did not complete. Review the inputs and try again.",
        ) from error
    except Exception as error:
        logger.exception(
            "Campaign plan request failed unexpectedly.",
            extra={"workspace_id": str(request.workspace_id), "campaign_id": str(request.campaign_id)},
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Campaign planning is temporarily unavailable. Try again shortly.",
        ) from error
