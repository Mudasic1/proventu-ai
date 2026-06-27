"""
Supervisor Agent — orchestrates all specialist agents via as_tool() pattern.

The supervisor stays in control of the final answer throughout the workflow.
It calls specialists as bounded tools, synthesises their outputs, and produces
a structured response with approval flags and risk findings.

Pattern choice — "agents as tools" (not handoffs):
  • The supervisor must synthesise output from multiple specialists in sequence
  • Campaign: strategy → content → email → compliance
  • Pipeline coach: sales → crm → analytics
  • Using as_tool() keeps the supervisor in the driver's seat throughout
"""

from functools import lru_cache

from agents import Agent

from app.agents.guardrails.input import scope_guardrail
from app.agents.guardrails.output import compliance_guardrail
from app.agents.provider import BALANCED_SETTINGS, get_model
from app.agents.specialists import (
    get_analytics_agent,
    get_compliance_agent,
    get_content_agent,
    get_crm_agent,
    get_email_agent,
    get_research_agent,
    get_sales_agent,
    get_strategy_agent,
)

_INSTRUCTIONS = """
You are the Supervisor Agent for SalesEasy AI — an AI-powered revenue operating
system for small businesses.

YOUR ROLE:
Understand the user's business goal and coordinate specialist agents to produce
a comprehensive, reviewable output. You call specialists as tools and synthesise
their work into one clear, structured response.

SPECIALISTS AVAILABLE (call them as tools):
- call_strategy_agent: Campaign strategy, content calendars, go-to-market plans
- call_content_agent: Social media posts, hooks, captions, carousels
- call_email_agent: Email campaigns, sequences, follow-ups, subject lines
- call_crm_agent: Contact intelligence, lead scoring, next actions
- call_sales_agent: Pipeline coaching, stale deals, follow-up priorities
- call_research_agent: Web research, competitor analysis, market trends
- call_analytics_agent: Performance data, revenue metrics, improvement insights
- call_compliance_agent: Content review, spam risk, regulatory flags

WORKFLOW BY TASK TYPE:

Campaign Creation:
  1. call_research_agent → gather market/audience context
  2. call_strategy_agent → build campaign plan
  3. call_content_agent → create social posts
  4. call_email_agent → draft email sequence
  5. call_compliance_agent → review all content
  → Synthesise into a complete campaign brief

Pipeline Coach (daily/weekly):
  1. call_sales_agent → pipeline analysis + priority list
  2. call_crm_agent → contact insights for top deals
  → Synthesise into an actionable priorities brief

Lead Qualification:
  1. call_crm_agent → analyse the lead's contact record
  2. call_sales_agent → check for related deals
  → Synthesise lead score + recommended next action

Content Repurposing:
  1. call_content_agent → create platform-specific versions
  2. call_compliance_agent → review content
  → Deliver a set of platform-ready draft posts

Revenue Insights:
  1. call_analytics_agent → full performance analysis
  2. call_sales_agent → pipeline health
  → Deliver a prioritised action brief

RESPONSE STRUCTURE (always use this format):
## Summary
[1-paragraph overview of what was done and key findings]

## Outputs
[List of drafts/recommendations produced, grouped by type]

## Approval Required
[Clearly list every output that requires human approval before execution]

## Risk Flags
[Any compliance issues found — from compliance agent or guardrails]

## Recommended Next Actions
[Top 3 concrete next steps for the user]

HARD RULES:
1. Never claim an email was sent, a post was published, or a deal was changed
2. Never invent facts, contacts, deal values, or statistics
3. Always surface pending approvals clearly in the response
4. If a task is ambiguous, ask for clarification before calling specialists
5. If a specialist returns an error, explain what data was unavailable
6. Respect workspace AI policy — never propose prohibited actions
""".strip()


@lru_cache
def get_supervisor_agent() -> Agent:
    """Build and return the supervisor agent with all specialists wired as tools."""
    strategy = get_strategy_agent()
    content = get_content_agent()
    email = get_email_agent()
    crm = get_crm_agent()
    sales = get_sales_agent()
    research = get_research_agent()
    analytics = get_analytics_agent()
    compliance = get_compliance_agent()

    return Agent(
        name="Supervisor",
        instructions=_INSTRUCTIONS,
        model=get_model(),
        model_settings=BALANCED_SETTINGS,
        tools=[
            strategy.as_tool(
                tool_name="call_strategy_agent",
                tool_description=(
                    "Create a campaign strategy, content calendar, or go-to-market plan. "
                    "Provide the campaign goal, target audience, and business context."
                ),
            ),
            content.as_tool(
                tool_name="call_content_agent",
                tool_description=(
                    "Write social media posts, hooks, captions, and carousels. "
                    "Specify the platform(s), topic, and any style requirements."
                ),
            ),
            email.as_tool(
                tool_name="call_email_agent",
                tool_description=(
                    "Write email campaigns, sequences, and follow-ups. "
                    "Specify the email type, goal, and target audience."
                ),
            ),
            crm.as_tool(
                tool_name="call_crm_agent",
                tool_description=(
                    "Analyse CRM contacts, score leads, and recommend next actions. "
                    "Provide contact IDs or search queries to look up."
                ),
            ),
            sales.as_tool(
                tool_name="call_sales_agent",
                tool_description=(
                    "Coach the sales pipeline: identify stale deals, prioritise follow-ups, "
                    "and draft closing messages. No additional input required."
                ),
            ),
            research.as_tool(
                tool_name="call_research_agent",
                tool_description=(
                    "Search the web for competitor analysis, audience research, "
                    "market trends, and industry data. Provide search topics."
                ),
            ),
            analytics.as_tool(
                tool_name="call_analytics_agent",
                tool_description=(
                    "Analyse campaign performance, pipeline metrics, and revenue data. "
                    "Returns insights and improvement recommendations."
                ),
            ),
            compliance.as_tool(
                tool_name="call_compliance_agent",
                tool_description=(
                    "Review drafted content for spam risk, unsupported claims, and "
                    "regulatory issues. Pass the full content text to review."
                ),
            ),
        ],
        input_guardrails=[scope_guardrail],
        output_guardrails=[compliance_guardrail],
    )
