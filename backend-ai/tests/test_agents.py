"""Tests for the OpenAI Agents SDK-based guardrails and agent setup."""


from app.agents.guardrails.output import scan_campaign_plan, scan_text
from app.agents.setup import (
    CAMPAIGN_AGENT_INSTRUCTIONS,
    CHAT_AGENT_INSTRUCTIONS,
    SALES_AGENT_INSTRUCTIONS,
    build_agent_config,
)
from app.schemas import CampaignPlanDraft, EmailDraft, FollowUpTaskDraft, SocialPostDraft


def test_scan_text_highlights_urgency():
    findings = scan_text("This is a limited time offer. Act now!")
    codes = [f["code"] for f in findings]
    assert "urgency_language" in codes


def test_scan_text_highlights_guarantees():
    findings = scan_text("We guarantee a 100% increase in leads!")
    codes = [f["code"] for f in findings]
    assert "unsupported_guarantee" in codes


def test_scan_text_ignores_safe_text():
    findings = scan_text("We focus on helping service businesses grow.")
    assert len(findings) == 0


def test_scan_text_highlights_sensitive_claim():
    findings = scan_text("Our workshop can help cure your sales process.")
    codes = [f["code"] for f in findings]
    assert "sensitive_claim" in codes


def test_scan_campaign_plan_checks_social_posts():
    plan = CampaignPlanDraft(
        summary="A focused plan",
        recommended_angle="Make it easy",
        social_posts=[
            SocialPostDraft(
                platform="linkedin",
                content="Don't miss out on this limited time event!",
            ),
        ],
        email_drafts=[
            EmailDraft(name="test", subject="Hi", preview_text="Hello", body="Check it out."),
        ],
        follow_up_tasks=[
            FollowUpTaskDraft(title="Review campaign", due_in_days=1, priority="high"),
        ],
    )
    findings = scan_campaign_plan(plan)
    assert any(f.code == "urgency_language" for f in findings)


def test_scan_campaign_plan_checks_email_body():
    plan = CampaignPlanDraft(
        summary="A focused plan",
        recommended_angle="Make it easy",
        social_posts=[
            SocialPostDraft(platform="linkedin", content="Check out our new workshop!"),
        ],
        email_drafts=[
            EmailDraft(
                name="test", subject="Hi", preview_text="Hello",
                body="We guarantee you will see results!",
            ),
        ],
        follow_up_tasks=[
            FollowUpTaskDraft(title="Review campaign", due_in_days=1, priority="high"),
        ],
    )
    findings = scan_campaign_plan(plan)
    assert any(f.code == "unsupported_guarantee" for f in findings)


def test_build_agent_config_returns_model_and_instructions():
    """build_agent_config now returns a plain dict (shim for SDK-based agents)."""
    config = build_agent_config(CAMPAIGN_AGENT_INSTRUCTIONS)
    assert isinstance(config, dict)
    assert "model" in config
    assert "instructions" in config
    assert len(config["instructions"]) > 0


def test_agent_instructions_are_distinct():
    assert CAMPAIGN_AGENT_INSTRUCTIONS != CHAT_AGENT_INSTRUCTIONS
    assert SALES_AGENT_INSTRUCTIONS != CHAT_AGENT_INSTRUCTIONS


def test_supervisor_has_all_specialists():
    """Supervisor agent should have exactly 8 specialist tools."""
    from app.agents.supervisor import get_supervisor_agent
    sup = get_supervisor_agent()
    assert sup.name == "Supervisor"
    tool_names = {t.name for t in sup.tools}
    expected = {
        "call_strategy_agent",
        "call_content_agent",
        "call_email_agent",
        "call_crm_agent",
        "call_sales_agent",
        "call_research_agent",
        "call_analytics_agent",
        "call_compliance_agent",
    }
    assert tool_names == expected


def test_supervisor_has_guardrails():
    from app.agents.supervisor import get_supervisor_agent
    sup = get_supervisor_agent()
    assert len(sup.input_guardrails) == 1
    assert len(sup.output_guardrails) == 1


def test_mcp_server_exposes_crm_tools():
    from app.agents.mcp.server import mcp
    tool_names = {t.name for t in mcp._tool_manager.list_tools()}
    assert "search_contacts" in tool_names
    assert "get_pipeline_metrics" in tool_names
    assert "list_deals" in tool_names
