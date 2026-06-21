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


def scan_text(text: str) -> list[dict]:
    findings = []
    for code, severity, pattern, message in RISK_PATTERNS:
        if pattern.search(text):
            findings.append({"code": code, "severity": severity, "message": message})
    return findings


def scan_campaign_plan(plan: CampaignPlanDraft) -> list[GuardrailFinding]:
    findings = []

    findings.extend(
        GuardrailFinding(
            code=f["code"], severity=f["severity"], message=f["message"],
            draft_kind="plan", draft_index=None,
        )
        for f in scan_text(f"{plan.summary}\n{plan.recommended_angle}")
    )

    for i, post in enumerate(plan.social_posts):
        findings.extend(
            GuardrailFinding(
                code=f["code"], severity=f["severity"], message=f["message"],
                draft_kind="social_post", draft_index=i,
            )
            for f in scan_text(post.content)
        )

    for i, email in enumerate(plan.email_drafts):
        findings.extend(
            GuardrailFinding(
                code=f["code"], severity=f["severity"], message=f["message"],
                draft_kind="email", draft_index=i,
            )
            for f in scan_text(f"{email.subject}\n{email.preview_text}\n{email.body}")
        )

    return findings
