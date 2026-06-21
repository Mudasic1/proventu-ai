import asyncio
import logging

from fastapi import APIRouter, Depends

from app.api.deps import require_internal_secret
from app.agents.setup import (
    CAMPAIGN_AGENT_INSTRUCTIONS,
    CHAT_AGENT_INSTRUCTIONS,
    SALES_AGENT_INSTRUCTIONS,
    build_agent_config,
)
from app.schemas.chat import AgentRunRequest, AgentRunResponse, ChatRequest, ChatResponse

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(require_internal_secret)])

_agent_lock = asyncio.Lock()
_agent_instance = None


async def _get_or_create_agent():
    global _agent_instance
    if _agent_instance is None:
        from google.antigravity import Agent

        config = build_agent_config(CHAT_AGENT_INSTRUCTIONS)
        _agent_instance = Agent(config)
        await _agent_instance.__aenter__()
    return _agent_instance


@router.post("/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    user_messages = [m for m in request.messages if m.role in ("user", "assistant")]
    user_text = "\n".join(f"{m.role}: {m.content}" for m in user_messages) if user_messages else "Hello"

    try:
        async with _agent_lock:
            agent = await _get_or_create_agent()
            response = await agent.chat(user_text)
            reply = await response.text()

        return ChatResponse(
            message={"role": "assistant", "content": reply},
        )
    except Exception as exc:
        logger.warning("Chat request failed: %s", exc)
        return ChatResponse(
            message={
                "role": "assistant",
                "content": "I'm having trouble connecting right now. Please try again in a moment.",
            },
        )


@router.post("/v1/agent/run", response_model=AgentRunResponse)
async def run_agent(request: AgentRunRequest) -> AgentRunResponse:
    instructions = CHAT_AGENT_INSTRUCTIONS
    if "campaign" in request.task_type or "strategy" in request.task_type:
        instructions = CAMPAIGN_AGENT_INSTRUCTIONS
    elif "sales" in request.task_type or "pipeline" in request.task_type:
        instructions = SALES_AGENT_INSTRUCTIONS

    from google.antigravity import Agent

    config = build_agent_config(instructions)
    try:
        async with Agent(config) as agent:
            context_str = (
                f"Task: {request.goal}\n"
                f"Context: {request.workspace_context or {}}"
            )
            response = await agent.chat(context_str)
            reply = await response.text()

        return AgentRunResponse(
            agent_run_id="antigravity-run",
            agent_name="antigravity_agent",
            summary=reply[:200],
            requires_approval="approval" in request.task_type or "send" in request.task_type,
            risk_level="low",
            output={"full_response": reply},
        )
    except Exception as exc:
        logger.warning("Agent run failed: %s", exc)
        return AgentRunResponse(
            agent_run_id="antigravity-run",
            agent_name="antigravity_agent",
            summary="Agent run encountered an issue.",
            requires_approval=False,
            risk_level="medium",
            output={"error": str(exc)},
        )
