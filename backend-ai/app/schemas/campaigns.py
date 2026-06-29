from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class BusinessProfileContext(StrictModel):
    business_name: str = Field(min_length=2, max_length=160)
    industry: str = Field(min_length=2, max_length=160)
    target_audience: str = Field(min_length=8, max_length=2_000)
    brand_voice: str = Field(min_length=3, max_length=2_000)
    products_services: str = Field(min_length=8, max_length=4_000)
    sales_process: str = Field(min_length=8, max_length=4_000)


class OfferContext(StrictModel):
    id: UUID
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=8, max_length=4_000)


class CampaignPlanRequest(StrictModel):
    request_key: UUID
    workspace_id: UUID
    user_id: str = Field(min_length=1, max_length=200)
    campaign_id: UUID
    goal: str = Field(min_length=8, max_length=2_000)
    target_audience: str = Field(min_length=8, max_length=2_000)
    business_profile: BusinessProfileContext
    offer: OfferContext


class SocialPostDraft(StrictModel):
    platform: Literal["linkedin", "facebook", "instagram", "x"]
    content: str = Field(min_length=1, max_length=5_000)


class EmailDraft(StrictModel):
    name: str = Field(min_length=1, max_length=160)
    subject: str = Field(min_length=1, max_length=240)
    preview_text: str = Field(max_length=320)
    body: str = Field(min_length=1, max_length=20_000)


class FollowUpTaskDraft(StrictModel):
    title: str = Field(min_length=1, max_length=240)
    due_in_days: int = Field(ge=0, le=90)
    priority: Literal["low", "medium", "high"]


class CampaignPlanDraft(StrictModel):
    summary: str = Field(min_length=1, max_length=4_000)
    recommended_angle: str = Field(min_length=1, max_length=2_000)
    social_posts: list[SocialPostDraft] = Field(min_length=1, max_length=8)
    email_drafts: list[EmailDraft] = Field(min_length=1, max_length=4)
    follow_up_tasks: list[FollowUpTaskDraft] = Field(min_length=1, max_length=8)


class GuardrailFinding(StrictModel):
    code: str = Field(min_length=1, max_length=80)
    severity: Literal["low", "medium", "high"]
    message: str = Field(min_length=1, max_length=400)
    draft_kind: Literal["plan", "social_post", "email"]
    draft_index: int | None = Field(default=None, ge=0)


class CampaignPlanResponse(StrictModel):
    ai_run_id: UUID
    approval_required: Literal[True] = True
    plan: CampaignPlanDraft
    risk_flags: list[GuardrailFinding]
