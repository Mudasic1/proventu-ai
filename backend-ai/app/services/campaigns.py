from dataclasses import dataclass
import json
from typing import Protocol
from urllib import error, parse, request as urlrequest

from app.guardrails import scan_campaign_plan
from app.repositories import AiRunRepository
from app.schemas import CampaignPlanDraft, CampaignPlanRequest, CampaignPlanResponse

SYSTEM_PROMPT = """
You are a supervised campaign-planning assistant for a small-business revenue workspace.
Create reviewable drafts only. Do not claim that any content was sent, scheduled, or published.
Use only the supplied business profile, offer, goal, and audience. Avoid invented facts,
unsupported guarantees, fake statistics, and manipulative language. Return a concise plan with
channel-specific social drafts, email drafts, and follow-up tasks for human review.
""".strip()


@dataclass(frozen=True)
class GeneratedPlan:
    draft: CampaignPlanDraft
    provider_response_id: str | None
    input_tokens: int
    output_tokens: int


class CampaignPlanGenerator(Protocol):
    def generate(self, request: CampaignPlanRequest) -> GeneratedPlan: ...


class GoogleCampaignPlanGenerator:
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    def generate(self, request: CampaignPlanRequest) -> GeneratedPlan:
        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{parse.quote(self.model, safe='')}:generateContent"
            f"?key={parse.quote(self.api_key, safe='')}"
        )
        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                "Build a supervised campaign draft plan from this authorized "
                                "workspace context. Return only JSON matching this shape: "
                                "summary, recommended_angle, social_posts, email_drafts, "
                                "follow_up_tasks.\n\n"
                                f"{request.model_dump_json(indent=2)}"
                            )
                        }
                    ],
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.4,
            },
        }

        http_request = urlrequest.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlrequest.urlopen(http_request, timeout=45) as response:
                provider_payload = json.loads(response.read().decode("utf-8"))
        except error.URLError as exc:
            raise RuntimeError("Google campaign planning request failed.") from exc

        text = _extract_google_text(provider_payload)
        draft = CampaignPlanDraft.model_validate_json(text)
        usage = provider_payload.get("usageMetadata") or {}
        return GeneratedPlan(
            draft=draft,
            provider_response_id=provider_payload.get("responseId"),
            input_tokens=int(usage.get("promptTokenCount") or 0),
            output_tokens=int(usage.get("candidatesTokenCount") or 0),
        )


def _extract_google_text(provider_payload: dict) -> str:
    candidates = provider_payload.get("candidates") or []
    if not candidates:
        raise RuntimeError("Google did not return a campaign plan candidate.")

    parts = candidates[0].get("content", {}).get("parts") or []
    text = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
    if not text.strip():
        raise RuntimeError("Google returned an empty campaign plan.")
    return text


class CampaignPlanService:
    def __init__(
        self,
        repository: AiRunRepository,
        generator: CampaignPlanGenerator,
        model: str,
    ):
        self.repository = repository
        self.generator = generator
        self.model = model

    def create_plan(self, request: CampaignPlanRequest) -> CampaignPlanResponse:
        completed = self.repository.find_completed(request.workspace_id, request.request_key)
        if completed:
            return completed

        run_id = self.repository.start(request, self.model)
        try:
            generated = self.generator.generate(request)
            result = CampaignPlanResponse(
                ai_run_id=run_id,
                approval_required=True,
                plan=generated.draft,
                risk_flags=scan_campaign_plan(generated.draft),
            )
            self.repository.complete(
                run_id,
                result,
                generated.provider_response_id,
                generated.input_tokens,
                generated.output_tokens,
            )
            return result
        except Exception:
            self.repository.fail(
                run_id,
                "AI_RUN_FAILED",
                "Campaign planning did not complete. Review the inputs and try again.",
            )
            raise
