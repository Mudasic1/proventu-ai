"""Tests for the Antigravity-agent-based system (guardrails, setup, tools, rag)."""

from app.agents.guardrails import scan_campaign_plan, scan_text
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
            SocialPostDraft(platform="linkedin", content="Don't miss out on this limited time event!"),
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


def test_build_agent_config_has_system_instructions():
    config = build_agent_config(CAMPAIGN_AGENT_INSTRUCTIONS)
    assert config.system_instructions is not None
    assert len(config.system_instructions) > 0


def test_build_agent_config_has_tools():
    config = build_agent_config(CHAT_AGENT_INSTRUCTIONS)
    assert config.tools is not None
    assert len(config.tools) == 6


def test_agent_instructions_are_distinct():
    assert CAMPAIGN_AGENT_INSTRUCTIONS is not CHAT_AGENT_INSTRUCTIONS
    assert SALES_AGENT_INSTRUCTIONS is not CHAT_AGENT_INSTRUCTIONS


def test_rag_index_delete_roundtrip():
    from app.agents import rag as rag_mod

    stored_client = rag_mod._client
    rag_mod._client = None

    from qdrant_client import QdrantClient
    import tempfile

    tmp = tempfile.mkdtemp()
    custom_path = tmp + "\\.qdrant_data"
    rag_mod._client = QdrantClient(path=custom_path)
    rag_mod._ensure_collection(rag_mod._client)

    rag_mod.index_document(
        "rag_test_1", "Test doc about sales strategy.",
        {"source": "unittest"}, [0.1] * 768,
    )
    rag_mod.index_document(
        "rag_test_2", "Test doc about email marketing.",
        {"source": "unittest"}, [0.2] * 768,
    )

    results = rag_mod.search_knowledge([0.1] * 768, limit=5)
    assert any(r["doc_id"] == "rag_test_1" for r in results)

    rag_mod.delete_document("rag_test_1")
    results_after = rag_mod.search_knowledge([0.1] * 768, limit=5)
    assert not any(r["doc_id"] == "rag_test_1" for r in results_after)

    rag_mod._client.close()
    rag_mod._client = stored_client
