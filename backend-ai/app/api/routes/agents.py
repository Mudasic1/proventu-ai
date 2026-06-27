"""
Multi-agent API routes — /v1/agents/*

Four endpoints covering the main autonomous workflows:

  POST /v1/agents/run             — General-purpose supervisor run
  POST /v1/agents/pipeline-coach  — Daily/weekly pipeline coaching
  POST /v1/agents/repurpose       — Content repurposing across platforms
  POST /v1/agents/qualify-lead    — Lead qualification for a CRM contact
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_agent_runner, require_internal_secret
from app.schemas.agents import (
    AgentRunResult,
    ContentRepurposeRequest,
    LeadQualifyRequest,
    MultiAgentRequest,
    PipelineCoachRequest,
)
from app.services.agent_runner import AgentRunner

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/v1/agents",
    dependencies=[Depends(require_internal_secret)],
)


@router.post("/run", response_model=AgentRunResult)
async def run_agent(
    request: MultiAgentRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> AgentRunResult:
    """General-purpose supervised multi-agent run.

    Submit any supported sales/marketing goal. The Supervisor routes the task
    to the appropriate specialists, synthesises their work, and returns a
    structured result with pending approvals and risk flags.

    Supported task_types: campaign, pipeline_coach, lead_qualify,
    content_repurpose, revenue_insights, email_sequence, research, chat.
    """
    try:
        return await runner.run(request)
    except Exception as exc:
        logger.exception(
            "Agent run failed. workspace=%s task=%s",
            request.workspace_id, request.task_type,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Agent run did not complete. "
                "Check your workspace context and try again."
            ),
        ) from exc


@router.post("/pipeline-coach", response_model=AgentRunResult)
async def pipeline_coach(
    request: PipelineCoachRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> AgentRunResult:
    """Run the Pipeline Coach agent for daily/weekly sales priorities.

    Returns a prioritised list of deals needing attention, follow-up drafts,
    at-risk deal flags, and pipeline health summary. All follow-up tasks
    are surfaced as pending approvals — not auto-committed.
    """
    full_request = MultiAgentRequest(
        workspace_id=request.workspace_id,
        user_id=request.user_id,
        task_type="pipeline_coach",
        goal=request.focus or "What should I focus on in my pipeline this week?",
        business_profile=request.business_profile,
    )
    try:
        return await runner.run(full_request)
    except Exception as exc:
        logger.exception(
            "Pipeline coach failed. workspace=%s", request.workspace_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Pipeline coach did not complete. Please try again.",
        ) from exc


@router.post("/repurpose", response_model=AgentRunResult)
async def repurpose_content(
    request: ContentRepurposeRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> AgentRunResult:
    """Repurpose one piece of content into multiple platform-specific posts.

    Takes a source idea, blog post, or existing content and creates
    platform-optimised versions for the requested platforms.
    All outputs are drafts requiring human review before scheduling.
    """
    platforms = ", ".join(request.target_platforms) if request.target_platforms else "all platforms"
    full_request = MultiAgentRequest(
        workspace_id=request.workspace_id,
        user_id=request.user_id,
        task_type="content_repurpose",
        goal=(
            f"Repurpose the following content into posts for: {platforms}.\n\n"
            f"Original content:\n{request.original_content}"
        ),
        business_profile=request.business_profile,
    )
    try:
        return await runner.run(full_request)
    except Exception as exc:
        logger.exception(
            "Content repurpose failed. workspace=%s", request.workspace_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Content repurposing did not complete. Please try again.",
        ) from exc


@router.post("/qualify-lead", response_model=AgentRunResult)
async def qualify_lead(
    request: LeadQualifyRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> AgentRunResult:
    """Qualify a CRM lead and get recommended next actions.

    Analyses the contact record, assigns lead temperature (cold/warm/hot),
    suggests the next best action, and drafts a personalised follow-up message.
    """
    full_request = MultiAgentRequest(
        workspace_id=request.workspace_id,
        user_id=request.user_id,
        task_type="lead_qualify",
        goal=f"Qualify and recommend next actions for contact ID: {request.contact_id}",
        business_profile=request.business_profile,
        additional_context=f"contact_id={request.contact_id}",
    )
    try:
        return await runner.run(full_request)
    except Exception as exc:
        logger.exception(
            "Lead qualification failed. workspace=%s contact=%s",
            request.workspace_id, request.contact_id,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Lead qualification did not complete. Please try again.",
        ) from exc
