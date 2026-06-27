"""
AgentRunner service — executes multi-agent workflows via the Supervisor.

This is the core orchestration layer for the /v1/agents/* endpoints.
It wraps Runner.run(), captures activity logs + pending approvals from
WorkspaceContext, and returns a structured AgentRunResult.
"""

import logging
import time
from uuid import uuid4

from agents import InputGuardrailTripwireTriggered, Runner

from app.agents.context import AiPolicy, WorkspaceContext
from app.agents.provider import configure_tracing
from app.agents.supervisor import get_supervisor_agent
from app.core.config import get_settings
from app.schemas.agents import (
    AgentRunResult,
    MultiAgentRequest,
)

logger = logging.getLogger(__name__)


class AgentRunner:
    """Runs multi-agent workflows and returns structured results."""

    def __init__(self) -> None:
        configure_tracing()

    async def run(self, request: MultiAgentRequest) -> AgentRunResult:
        """Execute a supervised multi-agent run for the given goal.

        Returns an AgentRunResult with the final output, pending approvals,
        risk findings, and the activity log from the run.
        """
        run_id = uuid4()
        started_at = time.monotonic()

        # Build workspace context from request
        context = WorkspaceContext(
            workspace_id=request.workspace_id,
            user_id=request.user_id,
            business_name=request.business_profile.get("business_name", ""),
            industry=request.business_profile.get("industry", ""),
            target_audience=request.business_profile.get("target_audience", ""),
            brand_voice=request.business_profile.get("brand_voice", ""),
            products_services=request.business_profile.get("products_services", ""),
            sales_process=request.business_profile.get("sales_process", ""),
            task_type=request.task_type,
            campaign_goal=request.goal,
            offer_name=request.offer_context.get("name", "") if request.offer_context else "",
            offer_description=(
                request.offer_context.get("description", "") if request.offer_context else ""
            ),
            policy=AiPolicy(
                prohibited_actions=request.prohibited_actions or [],
            ),
        )

        context.log_activity(
            step="run_started",
            detail=f"Supervisor run started. Task: {request.task_type}. Goal: {request.goal[:100]}",
            agent="supervisor",
        )

        settings = get_settings()
        supervisor = get_supervisor_agent()

        status = "completed"
        final_output = ""
        error_message: str | None = None

        try:
            result = await Runner.run(
                supervisor,
                input=_build_supervisor_input(request),
                context=context,
                max_turns=settings.max_agent_turns,
            )
            final_output = result.final_output or ""
            context.log_activity(
                step="run_completed",
                detail=f"Supervisor completed in {time.monotonic() - started_at:.1f}s",
                agent="supervisor",
            )

        except InputGuardrailTripwireTriggered as exc:
            status = "blocked"
            error_message = (
                "Request was blocked by safety guardrails. "
                "Please revise and try again."
            )
            context.log_activity(
                step="run_blocked",
                detail=f"Safety guardrail triggered: {exc}",
                agent="supervisor",
            )
            logger.warning(
                "Agent run %s blocked by guardrail. workspace=%s",
                run_id, request.workspace_id,
            )

        except Exception as exc:
            status = "failed"
            error_message = (
                "Agent run encountered an error. "
                f"Reason: {type(exc).__name__}. Please try again."
            )
            context.log_activity(
                step="run_failed",
                detail=f"Error: {type(exc).__name__}: {str(exc)[:200]}",
                agent="supervisor",
            )
            logger.exception(
                "Agent run %s failed unexpectedly. workspace=%s",
                run_id, request.workspace_id,
            )

        duration_ms = int((time.monotonic() - started_at) * 1000)

        return AgentRunResult(
            run_id=str(run_id),
            status=status,
            task_type=request.task_type,
            final_output=final_output,
            pending_approvals=context.pending_approvals,
            activity_log=context.activity_log,
            requires_approval=len(context.pending_approvals) > 0,
            error_message=error_message,
            duration_ms=duration_ms,
        )


def _build_supervisor_input(request: MultiAgentRequest) -> str:
    """Build the task description sent to the supervisor."""
    lines = [
        f"Task type: {request.task_type}",
        f"Goal: {request.goal}",
    ]

    bp = request.business_profile
    if bp:
        lines.append(
            f"Business: {bp.get('business_name', 'N/A')} "
            f"({bp.get('industry', 'unknown industry')})"
        )
        lines.append(f"Target audience: {bp.get('target_audience', 'not specified')}")

    if request.offer_context:
        lines.append(
            f"Offer: {request.offer_context.get('name', '')} — "
            f"{request.offer_context.get('description', '')}"
        )

    if request.additional_context:
        lines.append(f"Additional context: {request.additional_context}")

    return "\n".join(lines)
