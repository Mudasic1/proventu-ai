"""
Agents tools package.

Each sub-module exposes @function_tool decorated callables.
Tools that read the database accept RunContextWrapper[WorkspaceContext] as their
first parameter; the SDK injects it automatically so it never appears in the
LLM-visible tool schema.
"""

from app.agents.tools.analytics import get_campaign_analytics, get_revenue_metrics
from app.agents.tools.content import get_brand_guidelines, get_content_performance
from app.agents.tools.crm import (
    get_contact_summary,
    get_deals_needing_attention,
    get_pipeline_metrics,
    search_contacts,
)
from app.agents.tools.email import get_email_sequence_stats
from app.agents.tools.research import web_search
from app.agents.tools.tasks import draft_task

__all__ = [
    "get_contact_summary",
    "search_contacts",
    "get_pipeline_metrics",
    "get_deals_needing_attention",
    "web_search",
    "get_campaign_analytics",
    "get_revenue_metrics",
    "draft_task",
    "get_brand_guidelines",
    "get_content_performance",
    "get_email_sequence_stats",
]
