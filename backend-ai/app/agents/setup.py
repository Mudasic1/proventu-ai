"""
Backward-compatibility shim for the legacy campaign route.

The original setup.py imported from google.antigravity.  That package is
gone.  This module now re-exports only the symbols that the existing
campaign service and chat route still use, wired to the new SDK-based
implementation.

New code should import directly from app.agents.supervisor or
app.agents.specialists.
"""

from app.agents.context import WorkspaceContext
from app.agents.provider import configure_tracing, get_model
from app.agents.supervisor import get_supervisor_agent

# ── Legacy symbol compatibility ───────────────────────────────────────────────
# These are kept for any route / service that imported from the old setup.py.

CAMPAIGN_AGENT_INSTRUCTIONS = (
    "You are a supervised campaign-planning assistant. "
    "See app.agents.specialists.strategy for the full prompt."
)

CHAT_AGENT_INSTRUCTIONS = (
    "You are a helpful AI assistant for a revenue workspace. "
    "See app.agents.supervisor for the full Supervisor prompt."
)

SALES_AGENT_INSTRUCTIONS = (
    "You are a sales pipeline coach. "
    "See app.agents.specialists.sales for the full prompt."
)


def build_agent_config(system_instructions: str | None = None) -> dict:
    """Legacy stub — previously returned a LocalAgentConfig for google.antigravity.

    Returns a plain dict for compatibility; new code should use
    get_supervisor_agent() or get_*_agent() directly.
    """
    configure_tracing()
    return {
        "model": get_model(),
        "instructions": system_instructions or CHAT_AGENT_INSTRUCTIONS,
    }


__all__ = [
    "WorkspaceContext",
    "configure_tracing",
    "get_model",
    "get_supervisor_agent",
    "CAMPAIGN_AGENT_INSTRUCTIONS",
    "CHAT_AGENT_INSTRUCTIONS",
    "SALES_AGENT_INSTRUCTIONS",
    "build_agent_config",
]
