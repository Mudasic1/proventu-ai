from datetime import UTC, datetime
from typing import Protocol
from uuid import UUID, uuid4

import psycopg
from psycopg.rows import dict_row

from app.schemas import CampaignPlanRequest, CampaignPlanResponse, GuardrailFinding


class AiRunRepository(Protocol):
    def find_completed(
        self,
        workspace_id: UUID,
        request_key: UUID,
    ) -> CampaignPlanResponse | None: ...

    def start(self, request: CampaignPlanRequest, model: str) -> UUID: ...

    def complete(
        self,
        run_id: UUID,
        result: CampaignPlanResponse,
        provider_response_id: str | None,
        input_tokens: int,
        output_tokens: int,
    ) -> None: ...

    def fail(self, run_id: UUID, error_code: str, error_message: str) -> None: ...


class PostgresAiRunRepository:
    def __init__(self, database_uri: str):
        self.database_uri = database_uri

    def _connect(self):
        return psycopg.connect(self.database_uri, row_factory=dict_row)

    def find_completed(
        self,
        workspace_id: UUID,
        request_key: UUID,
    ) -> CampaignPlanResponse | None:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT result_json
                FROM ai_campaign_run
                WHERE workspace_id = %s AND request_key = %s AND status = 'completed'
                """,
                (workspace_id, request_key),
            )
            row = cursor.fetchone()
            return (
                CampaignPlanResponse.model_validate(row["result_json"])
                if row and row["result_json"]
                else None
            )

    def start(self, request: CampaignPlanRequest, model: str) -> UUID:
        run_id = uuid4()
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_campaign_run (
                    id, workspace_id, requested_by_user_id, request_key, campaign_id,
                    provider, model, status, purpose, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, 'google', %s, 'running',
                    'campaign_draft', %s, %s)
                ON CONFLICT (workspace_id, request_key) DO NOTHING
                RETURNING id
                """,
                (
                    run_id,
                    request.workspace_id,
                    request.user_id,
                    request.request_key,
                    request.campaign_id,
                    model,
                    datetime.now(UTC),
                    datetime.now(UTC),
                ),
            )
            row = cursor.fetchone()
            if row:
                return UUID(str(row["id"]))

            cursor.execute(
                """
                SELECT id, status
                FROM ai_campaign_run
                WHERE workspace_id = %s AND request_key = %s
                """,
                (request.workspace_id, request.request_key),
            )
            existing = cursor.fetchone()
            if not existing:
                raise RuntimeError("Unable to create or find the AI run.")
            if existing["status"] == "running":
                raise RuntimeError("A campaign plan with this request key is still running.")
            raise RuntimeError("The earlier campaign-plan request did not complete successfully.")

    def complete(
        self,
        run_id: UUID,
        result: CampaignPlanResponse,
        provider_response_id: str | None,
        input_tokens: int,
        output_tokens: int,
    ) -> None:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_campaign_run
                SET status = 'completed', result_json = %s, provider_response_id = %s,
                    input_tokens = %s, output_tokens = %s, completed_at = %s, updated_at = %s
                WHERE id = %s
                """,
                (
                    psycopg.types.json.Jsonb(result.model_dump(mode="json")),
                    provider_response_id,
                    input_tokens,
                    output_tokens,
                    datetime.now(UTC),
                    datetime.now(UTC),
                    run_id,
                ),
            )
            for finding in result.risk_flags:
                self._insert_finding(cursor, run_id, finding)

    def _insert_finding(self, cursor, run_id: UUID, finding: GuardrailFinding) -> None:
        cursor.execute(
            """
            INSERT INTO ai_guardrail_result (
                id, ai_run_id, code, severity, message, draft_kind, draft_index, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                uuid4(),
                run_id,
                finding.code,
                finding.severity,
                finding.message,
                finding.draft_kind,
                finding.draft_index,
                datetime.now(UTC),
            ),
        )

    def fail(self, run_id: UUID, error_code: str, error_message: str) -> None:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_campaign_run
                SET status = 'failed', error_code = %s, safe_error_message = %s,
                    completed_at = %s, updated_at = %s
                WHERE id = %s
                """,
                (
                    error_code,
                    error_message,
                    datetime.now(UTC),
                    datetime.now(UTC),
                    run_id,
                ),
            )
