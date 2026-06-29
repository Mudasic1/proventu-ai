"""
Campaign Plan Service — uses the OpenAI Agents SDK (via Google AI) to generate
a structured campaign plan draft and scan it with guardrails.

Replaces the previous raw-HTTP GoogleCampaignPlanGenerator with a proper
Agent-based workflow using the StrategyAgent + ContentAgent + EmailAgent.
"""

import logging
from dataclasses import dataclass
from typing import Protocol

from agents import InputGuardrailTripwireTriggered, Runner

from app.agents.context import WorkspaceContext
from app.agents.guardrails.output import scan_campaign_plan
from app.agents.provider import configure_tracing
from app.agents.specialists.strategy import get_strategy_agent
from app.core.config import get_settings
from app.repositories import AiRunRepository, PostgresAiRunRepository
from app.schemas import CampaignPlanDraft, CampaignPlanRequest, CampaignPlanResponse

logger = logging.getLogger(__name__)

# ── System prompt passed in the Runner input ──────────────────────────────────
_CAMPAIGN_TASK_TEMPLATE = """\
Create a complete campaign plan draft for human review.

Business: {business_name}
Industry: {industry}
Target audience: {target_audience}
Brand voice: {brand_voice}
Offer: {offer_name} — {offer_description}
Campaign goal: {goal}

Produce:
1. A 2-sentence campaign summary
2. The recommended campaign angle (1 sentence)
3. 4 social post drafts (one each for linkedin, facebook, instagram, x)
4. 2 email drafts (subject + preview + body)
5. 3 follow-up tasks with due_in_days and priority

Return valid JSON ONLY (no markdown fences) matching this exact structure:
{{
  "summary": "...",
  "recommended_angle": "...",
  "social_posts": [
    {{"platform": "linkedin", "content": "..."}},
    {{"platform": "facebook", "content": "..."}},
    {{"platform": "instagram", "content": "..."}},
    {{"platform": "x", "content": "..."}}
  ],
  "email_drafts": [
    {{"name": "...", "subject": "...", "preview_text": "...", "body": "..."}},
    {{"name": "...", "subject": "...", "preview_text": "...", "body": "..."}}
  ],
  "follow_up_tasks": [
    {{"title": "...", "due_in_days": 1, "priority": "high"}},
    {{"title": "...", "due_in_days": 3, "priority": "medium"}},
    {{"title": "...", "due_in_days": 7, "priority": "low"}}
  ]
}}
""".strip()


@dataclass(frozen=True)
class GeneratedPlan:
    draft: CampaignPlanDraft
    provider_response_id: str | None
    input_tokens: int
    output_tokens: int


class CampaignPlanGenerator(Protocol):
    async def generate(self, request: CampaignPlanRequest) -> GeneratedPlan: ...


class AgentsCampaignPlanGenerator:
    """Generates campaign plans using the OpenAI Agents SDK + Google AI."""

    def __init__(self) -> None:
        configure_tracing()

    async def generate(self, request: CampaignPlanRequest) -> GeneratedPlan:
        bp = request.business_profile
        offer = request.offer

        task_input = _CAMPAIGN_TASK_TEMPLATE.format(
            business_name=bp.business_name,
            industry=bp.industry,
            target_audience=request.target_audience,
            brand_voice=bp.brand_voice,
            offer_name=offer.name,
            offer_description=offer.description,
            goal=request.goal,
        )

        context = WorkspaceContext(
            workspace_id=str(request.workspace_id),
            user_id=request.user_id,
            business_name=bp.business_name,
            industry=bp.industry,
            target_audience=request.target_audience,
            brand_voice=bp.brand_voice,
            products_services=bp.products_services,
            sales_process=bp.sales_process,
            task_type="campaign",
            campaign_goal=request.goal,
            offer_name=offer.name,
            offer_description=offer.description,
        )

        # Use the strategy agent directly for the campaign plan endpoint
        # (the full supervisor workflow is used by the multi-agent /v1/agents/run endpoint)
        agent = get_strategy_agent()

        settings = get_settings()
        try:
            result = await Runner.run(
                agent,
                input=task_input,
                context=context,
                max_turns=settings.max_agent_turns,
            )
        except InputGuardrailTripwireTriggered as exc:
            raise RuntimeError(
                "Campaign request was blocked by safety guardrails."
            ) from exc

        raw_output = result.final_output or ""
        draft = _parse_campaign_plan(raw_output)

        return GeneratedPlan(
            draft=draft,
            provider_response_id=None,
            input_tokens=0,
            output_tokens=0,
        )


def _parse_campaign_plan(raw: str) -> CampaignPlanDraft:
    """Parse the LLM output (JSON) into a CampaignPlanDraft.

    Falls back to a minimal valid draft if parsing fails.
    """
    # Strip markdown fences if the model wrapped the output
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

    try:
        return CampaignPlanDraft.model_validate_json(text)
    except Exception as parse_error:
        logger.warning("Campaign plan JSON parse failed: %s", parse_error)

        # Attempt to extract JSON from a larger response body
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return CampaignPlanDraft.model_validate_json(text[start:end])
            except Exception:
                pass

        # Last resort: build a minimal draft from the raw text
        logger.warning("Falling back to minimal campaign plan draft.")
        return CampaignPlanDraft(
            summary=raw[:500] or "Campaign plan could not be structured. Review raw output.",
            recommended_angle="See summary for details.",
            social_posts=[
                {"platform": "linkedin", "content": "Draft pending review."},
            ],
            email_drafts=[
                {
                    "name": "Draft",
                    "subject": "Draft subject",
                    "preview_text": "",
                    "body": raw[:2000],
                }
            ],
            follow_up_tasks=[
                {"title": "Review AI-generated campaign plan", "due_in_days": 1, "priority": "high"}
            ],
        )


class CampaignPlanService:
    """Orchestrates campaign plan generation: idempotency + DB persistence."""

    def __init__(
        self,
        repository: AiRunRepository,
        generator: CampaignPlanGenerator,
        model: str,
    ) -> None:
        self.repository = repository
        self.generator = generator
        self.model = model

    async def create_plan(self, request: CampaignPlanRequest) -> CampaignPlanResponse:
        # Idempotency: return the completed plan if already generated
        completed = self.repository.find_completed(request.workspace_id, request.request_key)
        if completed:
            return completed

        run_id = self.repository.start(request, self.model)
        try:
            generated = await self.generator.generate(request)
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


def make_campaign_plan_service(database_uri: str, model: str) -> CampaignPlanService:
    """Factory — called once at startup via get_campaign_plan_service()."""
    return CampaignPlanService(
        repository=PostgresAiRunRepository(database_uri),
        generator=AgentsCampaignPlanGenerator(),
        model=model,
    )
