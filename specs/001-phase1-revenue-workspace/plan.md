# Implementation Plan: Phase 1 Core Revenue Workspace

**Spec**: [spec.md](./spec.md)  
**Created**: 2026-05-30  
**Artifact Mode**: Local planning only; no feature branch was created at user request.

## Summary

Build the Phase 1 revenue workspace as five vertical slices:

1. Protected workspace onboarding
2. Workspace-scoped CRM contacts
3. Pipeline deals and follow-up tasks
4. Supervised AI campaign planning with social and email drafts
5. Dashboard summaries backed by real workspace data

The repository currently contains a minimal `frontend/` Next.js application and a minimal `backend-ai/` Python service scaffold. The frontend owns authentication, workspace membership, product records, user-facing routes, and database migrations. The AI backend owns campaign generation orchestration, guardrails, AI-run records, and typed AI endpoints. Shared business records have one source of truth in the frontend-owned schema.

## Technical Context

### Existing Repository

- **Frontend**: `frontend/` with Next.js, React, TypeScript, Tailwind CSS, and shadcn-compatible UI setup
- **AI backend**: `backend-ai/` Python project scaffold
- **Engineering guide**: `development-flow.md`
- **Database expectation**: Neon Postgres with frontend-owned business tables and backend-owned `ai_*` runtime tables

### Required Additions

- Frontend authentication and workspace session guards
- Frontend database configuration, schema, migrations, query layer, mutation layer, and validation
- Protected dashboard shell and product routes
- Python API application structure, configuration, database session, error model, auth/workspace context, campaign generation service, guardrails, and tests
- Stable frontend-to-backend contract for campaign generation
- Automated tests for access isolation, mutations, API contracts, and critical user journeys

## Architecture Boundaries

### Frontend Ownership

`frontend/` owns:

- Authentication and protected routes
- Workspaces and memberships
- Business profiles and offers
- Contacts, companies, imports, tags, and activity entries
- Pipelines, stages, deals, and tasks
- Campaigns, social drafts, email drafts, and approvals
- Dashboard queries
- User-facing pages, forms, server actions, and UI state

### AI Backend Ownership

`backend-ai/` owns:

- Typed HTTP API and health endpoint
- Server-only configuration
- Authenticated workspace context for AI requests
- Campaign planning orchestration
- Structured campaign plan output
- Risk and marketing-claim guardrails
- Idempotency handling for expensive generation requests
- AI run and guardrail result records
- Predictable API error responses

### Shared Data Rule

Frontend migrations are the sole owner of core business tables. The AI backend may read the minimum required business context and write backend-owned `ai_*` runtime records. It must not introduce duplicate CRM, pipeline, campaign, or approval tables.

## Constitution Check

*GATE: Passed before implementation planning. Re-check after design changes.*

- **Workspace isolation**: Every frontend-owned business record, dashboard query, AI request, and
  AI runtime record is workspace scoped. Authorization is resolved from authenticated server
  context rather than browser-submitted workspace identifiers.
- **Human-controlled AI**: Phase 1 AI behavior is limited to supervised planning, drafting, risk
  flagging, and follow-up suggestions. Emails are not sent and posts are not published. Draft
  approvals and sensitive actions are auditable.
- **Domain ownership**: `frontend/` owns authentication and product data migrations. `backend-ai/`
  owns AI orchestration, guardrails, and `ai_*` runtime records. The HTTP contract is documented in
  [contracts/http-api.md](./contracts/http-api.md).
- **Vertical slice**: The plan delivers onboarding, CRM, pipeline, supervised campaign drafts, and
  a real-data dashboard. Scheduling, external sending, publishing, automation, multi-agent
  orchestration, and advanced analytics are deferred.
- **Quality gates**: Tasks include migrations, typed validation, predictable errors, audit history,
  workspace-isolation regression tests, AI guardrail tests, API contract tests, and a critical
  browser flow.

## Source Structure

```text
frontend/
├── drizzle/
│   ├── schema.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── onboarding/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── crm/
│   │   ├── pipeline/
│   │   ├── campaigns/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── permissions/
│   │   ├── api-client/
│   │   └── validations/
│   └── server/
│       ├── actions/
│       ├── queries/
│       └── mutations/
└── tests/
    ├── integration/
    └── unit/

backend-ai/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/
│   ├── core/
│   ├── db/
│   ├── schemas/
│   ├── services/
│   ├── agents/
│   └── guardrails/
└── tests/
```

## Data Model

The detailed product data model is documented in [data-model.md](./data-model.md).

### Frontend-Owned Tables

- `users`
- `workspaces`
- `workspace_members`
- `business_profiles`
- `offers`
- `contacts`
- `companies`
- `contact_imports`
- `contact_import_rows`
- `activity_entries`
- `pipelines`
- `pipeline_stages`
- `deals`
- `tasks`
- `campaigns`
- `social_drafts`
- `email_drafts`
- `approvals`

### Backend-Owned Tables

- `ai_agent_runs`
- `ai_guardrail_results`

## API Contracts

The HTTP contract is documented in [contracts/http-api.md](./contracts/http-api.md).

### Frontend-Local Operations

Frontend server actions handle workspace, contacts, imports, deals, tasks, draft review, and dashboard reads.

### AI Backend Operations

- `GET /health`
- `POST /v1/campaign-plans`

Responses use a stable success envelope with `data` and `meta`, or an error envelope with `error.code`, `error.message`, and `error.details`.

## Security and Trust

- Every business query and mutation is workspace scoped.
- Workspace access is resolved from the authenticated user context, not trusted from browser-submitted identifiers.
- Inputs are validated at forms, server actions, backend requests, and AI structured outputs.
- Generated content remains a draft.
- Emails are never sent and social posts are never published in Phase 1.
- Contact removal requires confirmation and an activity record.
- AI campaign generation uses idempotency keys to avoid duplicate runs.
- Logs exclude tokens, secrets, and unnecessary sensitive data.

## Testing Strategy

### Frontend

- Unit tests for validation and dashboard calculation helpers
- Integration tests for workspace guards and workspace-scoped queries
- Integration tests for contacts, imports, deals, tasks, approvals, and dashboard summaries
- Critical browser-level flow covering onboarding through draft approval

### AI Backend

- Unit tests for structured campaign generation, idempotency, and guardrails
- API tests for health, successful campaign planning, validation failures, unauthorized access, and predictable errors

## Delivery Order

1. Set up project dependencies, environment validation, database migration support, test harnesses, and shared error contracts.
2. Deliver onboarding and protected workspace access.
3. Deliver contacts and contact activity.
4. Deliver pipeline deals and follow-up tasks.
5. Deliver supervised AI campaign planning and approval review.
6. Deliver dashboard summaries and empty states.
7. Run cross-cutting validation for workspace isolation, responsive layouts, and trust rules.

## Deferred Work

- External email sending and tracking
- Social account connection, scheduling, and publishing
- Email sequence execution
- Automation builder
- Unified inbox
- Advanced permissions and agency portal
- Multi-agent orchestration and handoffs
- Advanced analytics, attribution, and forecasting
