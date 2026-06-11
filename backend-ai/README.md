# SalesEasyAI AI Backend

Supervised AI orchestration for SalesEasyAI. The service owns `ai_*` runtime
records, structured generation, and deterministic guardrails. Product records
and human review state remain owned by `frontend/`.

## Local setup

```powershell
Copy-Item .env.example .env
uv sync
uv run uvicorn main:app --reload --port 8000
```

Set `GOOGLE_API_KEY` and `GOOGLE_MODEL` in `.env` for campaign generation.

Apply [`migrations/0001_ai_campaign_runtime.sql`](./migrations/0001_ai_campaign_runtime.sql)
to the same Postgres database used by the frontend before generating plans.

## Verification

```powershell
uv run pytest
uv run ruff check .
```
