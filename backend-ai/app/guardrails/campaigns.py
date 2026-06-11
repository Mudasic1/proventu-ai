import re

from app.schemas import CampaignPlanDraft, GuardrailFinding

RISK_PATTERNS = (
    (
        "unsupported_guarantee",
        "high",
        re.compile(r"\b(guarantee(?:d)?|100%|risk[- ]free|no risk)\b", re.IGNORECASE),
        "Review absolute or guaranteed claims before using this draft.",
    ),
    (
        "urgency_language",
        "medium",
        re.compile(r"\b(act now|last chance|limited time|don't miss out)\b", re.IGNORECASE),
        "Review urgency language and confirm it matches the real offer.",
    ),
    (
        "sensitive_claim",
        "medium",
        re.compile(r"\b(cure|diagnose|legal advice|financial advice)\b", re.IGNORECASE),
        "Review regulated or sensitive claims before using this draft.",
    ),
)


def _scan_text(
    text: str,
    draft_kind: str,
    draft_index: int | None,
) -> list[GuardrailFinding]:
    findings: list[GuardrailFinding] = []
    for code, severity, pattern, message in RISK_PATTERNS:
        if pattern.search(text):
            findings.append(
                GuardrailFinding(
                    code=code,
                    severity=severity,
                    message=message,
                    draft_kind=draft_kind,
                    draft_index=draft_index,
                )
            )
    return findings


def scan_campaign_plan(plan: CampaignPlanDraft) -> list[GuardrailFinding]:
    findings = _scan_text(
        f"{plan.summary}\n{plan.recommended_angle}",
        "plan",
        None,
    )
    for index, social_post in enumerate(plan.social_posts):
        findings.extend(_scan_text(social_post.content, "social_post", index))
    for index, email_draft in enumerate(plan.email_drafts):
        findings.extend(
            _scan_text(
                f"{email_draft.subject}\n{email_draft.preview_text}\n{email_draft.body}",
                "email",
                index,
            )
        )
    return findings
