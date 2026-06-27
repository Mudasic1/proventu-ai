"""
Schemas for the multi-agent /v1/agents/* endpoints.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field


class MultiAgentRequest(BaseModel):
    """Request body for POST /v1/agents/run."""

    workspace_id: str = Field(min_length=1, max_length=200)
    user_id: str = Field(min_length=1, max_length=200)

    task_type: Literal[
        "campaign",
        "pipeline_coach",
        "lead_qualify",
        "content_repurpose",
        "revenue_insights",
        "email_sequence",
        "research",
        "chat",
    ]
    goal: str = Field(min_length=1, max_length=4_000)

    # Workspace business profile (mirrors frontend workspace context)
    business_profile: dict[str, Any] = Field(default_factory=dict)

    # Optional offer context (for campaign / email tasks)
    offer_context: dict[str, Any] | None = Field(default=None)

    # Workspace AI policy — list of action names the owner has disabled
    prohibited_actions: list[str] = Field(default_factory=list)

    # Free-form additional context (e.g. a contact ID for lead qualification)
    additional_context: str = Field(default="", max_length=2_000)


class PendingApproval(BaseModel):
    """A protected action the agent proposed but did not execute."""

    action: str
    description: str
    content_preview: str
    risk_level: Literal["low", "medium", "high"]
    status: Literal["pending", "approved", "rejected"] = "pending"


class ActivityEntry(BaseModel):
    """One user-visible step in the AI activity log."""

    step: str
    detail: str
    agent: str


class AgentRunResult(BaseModel):
    """Response body for all /v1/agents/* endpoints."""

    run_id: str
    status: Literal["completed", "failed", "blocked", "requires_approval"]
    task_type: str
    final_output: str
    requires_approval: bool

    pending_approvals: list[dict[str, Any]] = Field(default_factory=list)
    activity_log: list[dict[str, Any]] = Field(default_factory=list)

    error_message: str | None = None
    duration_ms: int = 0


# ── Specialised request shortcuts ─────────────────────────────────────────────


class PipelineCoachRequest(BaseModel):
    """Request for the dedicated pipeline coach endpoint."""

    workspace_id: str = Field(min_length=1, max_length=200)
    user_id: str = Field(min_length=1, max_length=200)
    business_profile: dict[str, Any] = Field(default_factory=dict)
    focus: str = Field(
        default="What should I focus on in my pipeline this week?",
        max_length=1_000,
    )


class ContentRepurposeRequest(BaseModel):
    """Request to repurpose one piece of content into multiple platforms."""

    workspace_id: str = Field(min_length=1, max_length=200)
    user_id: str = Field(min_length=1, max_length=200)
    business_profile: dict[str, Any] = Field(default_factory=dict)
    original_content: str = Field(min_length=10, max_length=4_000)
    target_platforms: list[str] = Field(
        default_factory=lambda: ["linkedin", "instagram", "facebook", "x"],
    )


class LeadQualifyRequest(BaseModel):
    """Request to qualify a specific CRM lead."""

    workspace_id: str = Field(min_length=1, max_length=200)
    user_id: str = Field(min_length=1, max_length=200)
    contact_id: str = Field(min_length=1, max_length=200)
    business_profile: dict[str, Any] = Field(default_factory=dict)
