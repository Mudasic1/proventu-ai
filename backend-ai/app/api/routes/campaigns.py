"""Campaign plan route — /v1/campaign-plans (SDK-backed, async)."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_campaign_plan_service, require_internal_secret
from app.schemas.campaigns import CampaignPlanRequest, CampaignPlanResponse
from app.services.campaigns import CampaignPlanService

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_internal_secret)])


@router.post(
    "/v1/campaign-plans",
    response_model=CampaignPlanResponse,
)
async def create_campaign_plan(
    request: CampaignPlanRequest,
    service: CampaignPlanService = Depends(get_campaign_plan_service),
) -> CampaignPlanResponse:
    """Generate a supervised campaign plan draft.

    Uses the OpenAI Agents SDK + Google AI. Returns social posts, email drafts,
    follow-up tasks, and compliance risk flags. All outputs require human
    review before publishing or sending.
    """
    try:
        return await service.create_plan(request)
    except RuntimeError as error:
        logger.warning(
            "Campaign plan request failed safely. workspace=%s campaign=%s",
            request.workspace_id,
            request.campaign_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Campaign planning did not complete. Review the inputs and try again.",
        ) from error
    except Exception as error:
        logger.exception(
            "Campaign plan request failed unexpectedly. workspace=%s campaign=%s",
            request.workspace_id,
            request.campaign_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Campaign planning is temporarily unavailable. Try again shortly.",
        ) from error
