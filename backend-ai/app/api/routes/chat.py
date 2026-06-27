"""
Chat route — /v1/chat and legacy /v1/agent/run

Rewritten to use the OpenAI Agents SDK + Google AI via the Supervisor agent.
"""

import logging

from fastapi import APIRouter, Depends

from app.api.deps import get_agent_runner, require_internal_secret
from app.schemas.agents import MultiAgentRequest
from app.schemas.chat import AgentRunRequest, AgentRunResponse, ChatRequest, ChatResponse
from app.services.agent_runner import AgentRunner

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_internal_secret)])


@router.post("/v1/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> ChatResponse:
    """Simple chat endpoint — sends messages to the Supervisor agent."""
    user_messages = [m for m in request.messages if m.role == "user"]
    user_text = (user_messages[-1].content if user_messages else "Hello").strip() or "Hello"

    # Pull workspace_id / user_id from the system message if present.
    # The frontend embeds them as space-separated key=value tokens, e.g.:
    #   "workspace_id=abc123 user_id=user_456"
    workspace_id = "anonymous"
    user_id = "anonymous"
    for m in request.messages:
        if m.role == "system":
            for part in m.content.split():
                if part.startswith("workspace_id="):
                    workspace_id = part.split("=", 1)[1] or workspace_id
                elif part.startswith("user_id="):
                    user_id = part.split("=", 1)[1] or user_id

    multi_request = MultiAgentRequest(
        workspace_id=workspace_id or "anonymous",
        user_id=user_id or "anonymous",
        task_type="chat",
        goal=user_text,
    )

    try:
        result = await runner.run(multi_request)
        reply = result.final_output or "I'm here to help with your sales and marketing goals."
    except Exception as exc:
        logger.warning("Chat request failed: %s", exc)
        reply = "I'm having trouble connecting right now. Please try again in a moment."

    return ChatResponse(
        message={"role": "assistant", "content": reply},
    )


@router.post("/v1/agent/run", response_model=AgentRunResponse)
async def run_agent_legacy(
    request: AgentRunRequest,
    runner: AgentRunner = Depends(get_agent_runner),
) -> AgentRunResponse:
    """Legacy single-agent run endpoint.

    Maps to the new multi-agent Supervisor workflow.
    Use /v1/agents/run for full multi-agent capability.
    """
    multi_request = MultiAgentRequest(
        workspace_id=request.workspace_context.get("workspace_id", "unknown"),
        user_id=request.workspace_context.get("user_id", "unknown"),
        task_type=_map_task_type(request.task_type),
        goal=request.goal,
        business_profile=request.workspace_context,
    )

    try:
        result = await runner.run(multi_request)
        return AgentRunResponse(
            agent_run_id=result.run_id,
            agent_name="supervisor",
            summary=result.final_output[:200] if result.final_output else "Run completed.",
            requires_approval=result.requires_approval,
            risk_level="high" if result.requires_approval else "low",
            output={
                "full_response": result.final_output,
                "pending_approvals": result.pending_approvals,
                "activity_log": result.activity_log,
            },
        )
    except Exception as exc:
        logger.warning("Legacy agent run failed: %s", exc)
        return AgentRunResponse(
            agent_run_id="error",
            agent_name="supervisor",
            summary="Agent run encountered an issue.",
            requires_approval=False,
            risk_level="medium",
            output={"error": str(exc)},
        )


def _map_task_type(legacy_type: str) -> str:
    """Map legacy task_type strings to the new Literal values."""
    mapping = {
        "campaign_creation": "campaign",
        "campaign": "campaign",
        "pipeline": "pipeline_coach",
        "pipeline_coach": "pipeline_coach",
        "sales": "pipeline_coach",
        "email": "email_sequence",
        "content": "content_repurpose",
        "lead_qualify": "lead_qualify",
        "analytics": "revenue_insights",
        "research": "research",
    }
    for key, value in mapping.items():
        if key in legacy_type.lower():
            return value
    return "chat"
