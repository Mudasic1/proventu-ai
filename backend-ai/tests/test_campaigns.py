from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api import app
from app.api.dependencies import get_campaign_plan_service, require_internal_secret
from app.schemas import (
    CampaignPlanDraft,
    CampaignPlanResponse,
    EmailDraft,
    FollowUpTaskDraft,
    SocialPostDraft,
)
from app.services import CampaignPlanService, GeneratedPlan


class MemoryRepository:
    def __init__(self):
        self.completed: dict[tuple[UUID, UUID], CampaignPlanResponse] = {}
        self.requests: dict[UUID, tuple[UUID, UUID]] = {}

    def find_completed(self, workspace_id, request_key):
        return self.completed.get((workspace_id, request_key))

    def start(self, request, model):
        run_id = uuid4()
        self.requests[run_id] = (request.workspace_id, request.request_key)
        return run_id

    def complete(self, run_id, result, provider_response_id, input_tokens, output_tokens):
        self.completed[self.requests[run_id]] = result

    def fail(self, run_id, error_code, error_message):
        return None


class StubGenerator:
    def __init__(self):
        self.calls = 0

    def generate(self, request):
        self.calls += 1
        return GeneratedPlan(
            draft=CampaignPlanDraft(
                summary="A focused launch campaign.",
                recommended_angle="Make the next step easy to understand.",
                social_posts=[
                    SocialPostDraft(
                        platform="linkedin",
                        content="Book a review call. This is a limited time offer.",
                    )
                ],
                email_drafts=[
                    EmailDraft(
                        name="Launch note",
                        subject="A clearer next step",
                        preview_text="Review the offer.",
                        body="Here is a practical way to get started.",
                    )
                ],
                follow_up_tasks=[
                    FollowUpTaskDraft(
                        title="Review generated campaign drafts",
                        due_in_days=1,
                        priority="high",
                    )
                ],
            ),
            provider_response_id="resp_test",
            input_tokens=20,
            output_tokens=30,
        )


def payload():
    return {
        "request_key": str(uuid4()),
        "workspace_id": str(uuid4()),
        "user_id": "user_123",
        "campaign_id": str(uuid4()),
        "goal": "Promote the spring strategy workshop.",
        "target_audience": "Small service businesses that need a repeatable sales process.",
        "business_profile": {
            "business_name": "Northstar Studio",
            "industry": "Consulting",
            "target_audience": "Small service businesses",
            "brand_voice": "Clear, practical, and warm",
            "products_services": "Sales strategy workshops for service businesses",
            "sales_process": "Discovery call followed by a tailored workshop proposal",
        },
        "offer": {
            "id": str(uuid4()),
            "name": "Spring workshop",
            "description": "A practical sales strategy workshop with a written action plan",
        },
    }


def client_with_service(service):
    app.dependency_overrides[require_internal_secret] = lambda: None
    app.dependency_overrides[get_campaign_plan_service] = lambda: service
    return TestClient(app)


def test_campaign_plan_is_structured_flagged_and_idempotent():
    repository = MemoryRepository()
    generator = StubGenerator()
    client = client_with_service(CampaignPlanService(repository, generator, "test-model"))
    request_payload = payload()

    first = client.post("/v1/campaign-plans", json=request_payload)
    second = client.post("/v1/campaign-plans", json=request_payload)

    assert first.status_code == 200
    assert second.status_code == 200
    assert generator.calls == 1
    assert first.json()["approval_required"] is True
    assert first.json()["ai_run_id"] == second.json()["ai_run_id"]
    assert first.json()["risk_flags"][0]["code"] == "urgency_language"


def test_campaign_plan_rejects_invalid_workspace_context():
    repository = MemoryRepository()
    generator = StubGenerator()
    client = client_with_service(CampaignPlanService(repository, generator, "test-model"))
    request_payload = payload()
    request_payload["workspace_id"] = "not-a-uuid"

    response = client.post("/v1/campaign-plans", json=request_payload)

    assert response.status_code == 422
    assert generator.calls == 0
