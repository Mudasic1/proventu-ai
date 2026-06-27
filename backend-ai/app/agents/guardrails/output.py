"""
Output guardrail — compliance and spam-risk scan on agent output.

Two layers:
  1. Fast regex scan (deterministic, always runs) — catches known patterns
  2. SDK @output_guardrail — wraps the regex for the Agents SDK

Also exports scan_campaign_plan() used by the legacy campaign service.
"""

import re

from agents import Agent, GuardrailFunctionOutput, RunContextWrapper, output_guardrail

from app.agents.context import WorkspaceContext
from app.schemas.campaigns import CampaignPlanDraft, GuardrailFinding

# ── Risk patterns ─────────────────────────────────────────────────────────────
_RISK_PATTERNS: list[tuple[str, str, re.Pattern, str]] = [
    (
        "unsupported_guarantee",
        "high",
        re.compile(r"\b(guarantee(?:d)?|100%|risk[\s\-]free|no risk)\b", re.IGNORECASE),
        "Review absolute or guaranteed claims before using this draft.",
    ),
    (
        "urgency_language",
        "medium",
        re.compile(
            r"\b(act now|last chance|limited time|don't miss out|expires? (today|soon))\b",
            re.IGNORECASE,
        ),
        "Review urgency language and confirm it matches the real offer.",
    ),
    (
        "sensitive_claim",
        "high",
        re.compile(
            r"\b(cure|diagnose|treat|heal|legal advice|financial advice|tax advice)\b",
            re.IGNORECASE,
        ),
        "Review regulated or sensitive claims before using this draft.",
    ),
    (
        "spam_trigger",
        "medium",
        re.compile(
            r"\b(free money|make money fast|earn \$|winner|you.ve been selected|"
            r"click here to claim|verify your account|urgent response required)\b",
            re.IGNORECASE,
        ),
        "Draft contains spam-trigger phrases that may hurt email deliverability.",
    ),
    (
        "price_claim",
        "medium",
        re.compile(
            r"\b(cheapest|lowest price|best price|unbeatable deal)\b",
            re.IGNORECASE,
        ),
        "Superlative price claims may be misleading; confirm accuracy.",
    ),
]


# ── Core scan function ────────────────────────────────────────────────────────
def _scan_text(text: str) -> list[dict]:
    return [
        {"code": code, "severity": severity, "message": message}
        for code, severity, pattern, message in _RISK_PATTERNS
        if pattern.search(text)
    ]


def scan_text(text: str) -> list[dict]:
    """Public helper — returns list of risk findings for arbitrary text."""
    return _scan_text(text)


def scan_campaign_plan(plan: CampaignPlanDraft) -> list[GuardrailFinding]:
    """Scan a CampaignPlanDraft and return typed GuardrailFinding objects.

    Used by the campaign service for the legacy /v1/campaign-plans route.
    """
    findings: list[GuardrailFinding] = []

    for f in _scan_text(f"{plan.summary}\n{plan.recommended_angle}"):
        findings.append(
            GuardrailFinding(
                code=f["code"], severity=f["severity"], message=f["message"],
                draft_kind="plan", draft_index=None,
            )
        )

    for i, post in enumerate(plan.social_posts):
        for f in _scan_text(post.content):
            findings.append(
                GuardrailFinding(
                    code=f["code"], severity=f["severity"], message=f["message"],
                    draft_kind="social_post", draft_index=i,
                )
            )

    for i, email in enumerate(plan.email_drafts):
        for f in _scan_text(f"{email.subject}\n{email.preview_text}\n{email.body}"):
            findings.append(
                GuardrailFinding(
                    code=f["code"], severity=f["severity"], message=f["message"],
                    draft_kind="email", draft_index=i,
                )
            )

    return findings


# ── SDK output guardrail ──────────────────────────────────────────────────────
@output_guardrail
async def compliance_guardrail(
    context: RunContextWrapper[WorkspaceContext],
    agent: Agent,
    output: str,
) -> GuardrailFunctionOutput:
    """Scan the final agent output for risky claims and compliance issues.

    Does not block the output — surfaces findings for the frontend approval
    UI so users can review before sending/publishing anything.
    """
    findings = _scan_text(output)

    # High-severity findings are flagged as requiring extra attention
    has_high = any(f["severity"] == "high" for f in findings)

    return GuardrailFunctionOutput(
        output_info={
            "findings": findings,
            "finding_count": len(findings),
            "has_high_severity": has_high,
        },
        # We do not trip the wire — we surface findings for human review
        tripwire_triggered=False,
    )
