import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from google.antigravity import Agent, CapabilitiesConfig, LocalAgentConfig

from app.agents.tools import (
    create_campaign_plan_tool,
    generate_email_draft_tool,
    generate_social_post_tool,
    get_contact_summary_tool,
    get_pipeline_metrics_tool,
    search_knowledge_base_tool,
)
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def build_agent_config(
    system_instructions: str | None = None,
) -> LocalAgentConfig:
    settings = get_settings()
    return LocalAgentConfig(
        api_key=settings.google_api_key,
        system_instructions=system_instructions,
        capabilities=CapabilitiesConfig(),
        tools=[
            create_campaign_plan_tool,
            generate_social_post_tool,
            generate_email_draft_tool,
            get_contact_summary_tool,
            get_pipeline_metrics_tool,
            search_knowledge_base_tool,
        ],
    )


@asynccontextmanager
async def create_agent(
    system_instructions: str | None = None,
) -> AsyncIterator[Agent]:
    config = build_agent_config(system_instructions)
    async with Agent(config) as agent:
        yield agent


CAMPAIGN_AGENT_INSTRUCTIONS = """
You are a Campaign Agent for a small-business revenue workspace.
Your role is to create complete marketing campaigns — strategy, social posts,
email drafts, and follow-up tasks.

Responsibilities:
- Analyze business profile, offer, goal, and audience
- Recommend a campaign angle and content strategy
- Generate platform-specific social posts (linkedin, facebook, instagram, x)
- Create email drafts with subject, preview, and body
- Suggest follow-up tasks with priority and timing
- Never make unsupported guarantees or claims
- Mark outputs that require human approval before sending
""".strip()

CHAT_AGENT_INSTRUCTIONS = """
You are a helpful AI assistant for a revenue workspace called ProventuAI.
Answer questions about sales, marketing, CRM, and productivity.
Keep responses concise and actionable.
If you don't know something, say so clearly.
""".strip()

SALES_AGENT_INSTRUCTIONS = """
You are a Sales Agent for a small-business revenue workspace.
You analyze pipeline data, detect stale deals, suggest follow-ups,
and help prioritize revenue opportunities.

You have tools to search the knowledge base for contacts, campaigns,
and pipeline information.

Responsibilities:
- Identify deals that need attention
- Suggest follow-up actions with timing
- Flag high-value opportunities
- Recommend daily priorities
""".strip()
