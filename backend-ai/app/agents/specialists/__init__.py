"""
Specialist agents — each owns one domain of the revenue workspace.

All specialists are built lazily via get_*() functions so the Google AI
client (and its lru_cache) is only created when the service starts.

Import pattern:
    from app.agents.specialists import (
        get_strategy_agent, get_content_agent, get_email_agent,
        get_crm_agent, get_sales_agent, get_research_agent,
        get_analytics_agent, get_compliance_agent,
    )
"""

from app.agents.specialists.analytics import get_analytics_agent
from app.agents.specialists.compliance import get_compliance_agent
from app.agents.specialists.content import get_content_agent
from app.agents.specialists.crm_agent import get_crm_agent
from app.agents.specialists.email_agent import get_email_agent
from app.agents.specialists.research import get_research_agent
from app.agents.specialists.sales import get_sales_agent
from app.agents.specialists.strategy import get_strategy_agent

__all__ = [
    "get_strategy_agent",
    "get_content_agent",
    "get_email_agent",
    "get_crm_agent",
    "get_sales_agent",
    "get_research_agent",
    "get_analytics_agent",
    "get_compliance_agent",
]
