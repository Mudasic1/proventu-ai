# Implementation Plan: Subscription Credits and AI Jobs

**Branch**: `not-created (local artifacts only: 002-subscription-credit-jobs)` | **Date**: 2026-05-31 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-subscription-credit-jobs/spec.md`

## Summary

Build the paid-usage foundation for SalesEasyAI as a set of bounded vertical slices:

1. Workspace billing catalog and Stripe-hosted checkout
2. Verified, idempotent Stripe webhook inbox and reconciliation
3. Workspace wallet, expiring grants, immutable ledger, reservations, settlement, and reversals
4. Effective-dated provider/model pricing with integer-only credit conversion
5. Frontend-owned AI job requests plus backend-owned worker runs, claims, and usage records
6. Postgres-backed background dispatch, worker claims, retries, cancellation, and exactly-once financial finalization
7. Workspace usage and billing dashboards plus separate platform-operator administration
8. Rate limiting, structured logs, reconciliation tools, and risk-proportional automated tests

The frontend remains the sole owner of user-facing product, billing, wallet, ledger, pricing, and AI job-request migrations. The AI backend owns `ai_*` execution-runtime tables and runs a Postgres-backed worker. The two systems communicate through typed internal HTTP contracts. The AI backend never directly mutates frontend-owned financial tables.

## Technical Context

**Language/Version**: TypeScript 5 with Node.js 20+ for `frontend/`; Python 3.13+ for `backend-ai/`  
**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Better Auth 1.6.12, Drizzle ORM 0.45.2, Neon serverless driver 1.1.0, Zod 4.4.3, Stripe Node SDK; FastAPI, SQLModel, SQLAlchemy, psycopg, Pydantic, pytest, and Ruff for `backend-ai/`  
**Storage**: Neon Postgres; frontend-owned product and financial tables; backend-owned `ai_*` runtime tables  
**Testing**: Vitest and integration fixtures for frontend domain logic; pytest for backend worker and API behavior; Playwright for critical browser flows; Stripe CLI for local webhook validation  
**Target Platform**: Next.js server deployment for user-facing routes and scheduled handlers; long-running Python worker/API process for background AI execution; Neon Postgres shared database with explicit table ownership  
**Project Type**: Monorepo web application with frontend server routes and an internal AI worker service  
**Performance Goals**: Accept or reject an AI job request in under 1 second at p95 before model execution; acknowledge verified webhook receipt in under 2 seconds at p95 after durable inbox insertion; show current wallet and job history in under 2 seconds at p95 for ordinary workspace volumes  
**Constraints**: No negative balances; all financial mutations atomic and idempotent; browser redirects never grant credits; webhook handlers preserve the raw body for signature verification; backend workers never directly mutate frontend-owned wallet tables; no hardcoded provider/model pricing; logs redact secrets and minimize prompts and outputs  
**Scale/Scope**: Initial production slice for small-business workspaces; thousands of active workspaces, tens of thousands of wallet operations per day, and multiple concurrent worker processes without Redis or a separate queue broker

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked after Phase 1 design.*

- **Workspace isolation**: Passed. `workspace_billing_account`, `workspace_subscription`, `billing_purchase`, `payment_record`, `credit_wallet`, `credit_grant`, `credit_reservation`, `credit_ledger_entry`, `ai_job_request`, `ai_job_rate_limit_bucket`, and workspace-visible audit records carry `workspaceId`. User-facing reads and mutations resolve workspace context server-side. Global catalog and configuration tables are explicitly documented and require platform-administrator access.
- **Human-controlled AI**: Passed. This feature funds and executes background AI jobs but does not authorize external email sends, social publishing, destructive CRM mutation, or billing changes by AI. AI output remains subject to the existing supervised-draft rules. Job inputs and logs retain summaries and identifiers, not unnecessary raw prompts or outputs.
- **Domain ownership**: Passed. `frontend/` owns billing, wallet, pricing, request, dashboards, and all financial migrations. `backend-ai/` owns execution orchestration and `ai_*` runtime migrations. Cross-boundary enqueue, cancellation, and finalization use typed internal HTTP contracts. No table has competing migrations.
- **Vertical slice**: Passed. The first usable slice is: owner purchases plan, webhook grants credits, member queues job, wallet reserves credits, worker finalizes measured usage, unused credits return, user sees the ledger. Advanced invoices, overage billing, member budgets, and autonomous agent workflows remain deferred.
- **Quality gates**: Passed. Boundaries use validation, predictable error codes, append-only ledger and audit events, reviewed migrations, unit tests for credit arithmetic, integration tests for transaction safety and webhook idempotency, worker claim tests, and critical end-to-end purchase-to-usage flows.

## Architecture Decisions

### 1. Shared Financial State Is Frontend-Owned

`frontend/` owns the tables and services that change balances. This is the only place allowed to:

- Grant monthly credits or top-ups
- Reserve spendable credits
- Settle actual usage
- Release unused reservations
- Apply expirations, reversals, and manual adjustments
- Mark a workspace as spending-blocked for unresolved balances

The financial service uses transaction-capable Postgres connections, row-level locks, unique operation keys, and integer-only arithmetic.

### 2. Runtime Execution Is Backend-Owned

`backend-ai/` owns:

- `ai_job_run`
- `ai_job_claim`
- `ai_usage_record`
- `ai_worker_event`

The frontend creates `ai_job_request` and `ai_job_dispatch_outbox` records atomically with the reservation. A scheduled frontend dispatcher sends pending requests to the backend enqueue endpoint. The backend inserts an idempotent runtime row and workers claim runnable rows using ordered `FOR UPDATE SKIP LOCKED` transactions.

### 3. Finalization Uses an Idempotent Callback

The worker sends completion, failure, or cancellation data to a signed frontend internal endpoint. The frontend:

1. Locks the job request, reservation, wallet, and affected grant rows.
2. Checks the finalization operation key.
3. Applies settlement or release atomically.
4. Stores the pricing snapshot and safe result metadata.
5. Returns the stable final state for retried callbacks.

If measured cost exceeds the reservation, the frontend debits additional spendable credits only when the full difference is available. Otherwise it records an unresolved shortfall and blocks new spending without allowing a negative balance.

### 4. Stripe Webhooks Use a Durable Inbox

`POST /api/stripe/webhook` verifies the raw request body and signature, inserts a unique `stripe_webhook_event` inbox row, and returns quickly. A scheduled frontend processor reconciles events asynchronously.

Subscription Checkout completion associates Stripe customer and subscription identities with a workspace. Monthly credits are granted from successful paid invoices only, preventing a duplicate initial grant. One-time top-ups are fulfilled from paid Checkout Sessions. Refund and dispute events create reversals rather than editing prior ledger rows.

### 5. Credit Grants Preserve Provenance

Credits are stored in grant batches:

- Monthly included grants expire at the end of the paid billing period.
- Top-up grants do not expire while the account remains in good standing.
- Consumption uses first-expiring-first-out ordering.
- Reservation allocations bind credits to grants so refunds and expirations remain auditable.
- Expiration removes only unreserved amounts. Credits released after their grant expiry immediately expire instead of returning to spendable balance.

### 6. Model Pricing Is Effective-Dated Configuration

`model_pricing` stores provider/model cost configuration as integers:

- Input and output micro-USD cost per configured token unit
- Markup basis points
- Micro-USD per credit
- Effective date range
- Enabled status

Estimate and settlement use integer ceiling arithmetic. Every final job stores an immutable pricing snapshot so historical charges do not change when configuration changes.

### 7. AI Rate Limits Run Before Reservation

The frontend checks user, workspace, and job-type buckets before reserving credits. Rejections create auditable decisions but no job reservation and no backend runtime record.

## Project Structure

### Documentation (this feature)

```text
specs/002-subscription-credit-jobs/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- frontend-http.md
|   |-- backend-internal-api.md
|   |-- stripe-events.md
|   `-- financial-invariants.md
|-- checklists/
|   |-- requirements.md
|   `-- implementation.md
`-- tasks.md
```

### Source Code (repository root)

```text
frontend/
|-- drizzle/
|-- src/
|   |-- app/
|   |   |-- (dashboard)/
|   |   |   |-- usage/
|   |   |   |-- ai/jobs/
|   |   |   |-- settings/billing/
|   |   |   `-- admin/
|   |   `-- api/
|   |       |-- stripe/webhook/
|   |       |-- billing/
|   |       |-- ai/jobs/
|   |       `-- internal/
|   |-- components/
|   |   |-- billing/
|   |   |-- usage/
|   |   |-- ai-jobs/
|   |   `-- admin/
|   |-- lib/
|   |   |-- billing/
|   |   |-- credits/
|   |   |-- pricing/
|   |   |-- permissions/
|   |   `-- validations/
|   `-- server/
|       |-- actions/
|       |-- mutations/
|       |-- queries/
|       `-- services/
`-- tests/
    |-- unit/
    |-- integration/
    `-- e2e/

backend-ai/
|-- app/
|   |-- main.py
|   |-- api/
|   |   `-- routes/
|   |-- core/
|   |-- db/
|   |   |-- migrations/
|   |   |-- models/
|   |   `-- repositories/
|   |-- schemas/
|   |-- services/
|   `-- worker/
`-- tests/
    |-- unit/
    `-- integration/
```

**Structure Decision**: Extend the existing `frontend/` Next.js application and scaffold the existing `backend-ai/` Python service. Do not create a third application or a second financial schema. Use scheduled frontend route handlers for Stripe inbox processing and AI dispatch retries, and a long-running backend worker process for AI execution.

## Transaction Strategy

### Frontend Financial Connections

The current frontend uses `drizzle-orm/neon-http`, which is appropriate for simple reads and one-shot queries. Financial services require interactive transactions and row-level locks. Add a separate server-only transaction-capable Drizzle connection backed by `@neondatabase/serverless` `Pool` and `drizzle-orm/neon-serverless`.

Use the existing HTTP connection for ordinary read queries. Use the transaction-capable connection only for:

- Wallet creation
- Grant insertion and expiration
- Reservations and releases
- Settlements and reversals
- Manual adjustments
- Webhook inbox claims
- AI dispatch outbox claims
- Rate-limit bucket updates

### Lock Order

Use a consistent lock order to minimize deadlocks:

1. Workspace wallet
2. AI job request or billing purchase
3. Credit reservation
4. Credit grants ordered by expiry and ID
5. Reservation allocations

Use unique operation keys as the first idempotency barrier and database locks as the concurrency barrier.

### Backend Queue Connections

The Python worker uses a transaction-capable Postgres connection. Claims use an ordered query with `FOR UPDATE SKIP LOCKED`, set a lease expiration, commit, execute outside the claim transaction, and then finalize through the frontend callback.

## Delivery Phases

### Phase 0 - Foundation and Invariants

- Add required dependencies and environment validation.
- Add frontend financial schema and migrations.
- Add backend runtime schema and migrations.
- Implement integer-only pricing helpers.
- Implement wallet transactions and tests before Stripe or worker integration.

### Phase 1 - Stripe Billing

- Add plan, top-up, billing-account, purchase, payment, and event-inbox services.
- Add owner-only checkout and portal routes.
- Add webhook signature verification and durable inbox insertion.
- Add asynchronous event processing and reconciliation tests.

### Phase 2 - AI Requests and Runtime Queue

- Add frontend job request, reservation, outbox, and rate-limit services.
- Add signed internal dispatcher and finalization routes.
- Add backend enqueue and cancel endpoints.
- Add backend runtime models, queue repositories, worker leases, retries, and callback client.

### Phase 3 - Workspace Dashboards

- Extend the current revenue dashboard with wallet summary.
- Add usage overview, ledger history, job list, job details, and billing settings.
- Keep payment actions owner-only while allowing workspace members to inspect usage.

### Phase 4 - Platform Operations

- Add separate platform-administrator authorization.
- Add operations overview and searchable catalog, pricing, wallet, ledger, payment-event, refund, dispute, job, failure, and audit views.
- Add reason-required manual adjustment flow.

### Phase 5 - Hardening and Release

- Add scheduled reconciliation routes and operational runbook.
- Add concurrency, retry, redaction, cross-workspace, and platform-admin authorization tests.
- Run lint, typecheck, unit, integration, worker, and critical browser tests.
- Review migration rollback boundaries and reconcile existing production data before release.

## Testing Strategy

### Frontend Unit Tests

- Integer pricing estimates and settlement rounding
- Credit expiration ordering
- Rate-limit bucket calculations
- Validation for checkout, top-up, job creation, cancellation, and manual adjustment

### Frontend Integration Tests

- Wallet grants and immutable ledger entries
- Concurrent reservations near balance limits
- Settlement, unused-credit release, failure release, cancellation release, expiry-after-release behavior
- Top-up reversals, disputes, unresolved balances, spending blocks
- Webhook signature rejection, duplicate event insertion, event reconciliation, out-of-order delivery
- Owner-only billing access and separate platform-admin authorization
- AI job idempotency and dispatch retry behavior

### Backend Tests

- Enqueue idempotency
- Worker claim contention
- Lease expiration and stale recovery
- Retry limits
- Cancellation propagation
- Finalization callback retry behavior
- Safe logs without secrets or unnecessary prompt content

### End-to-End Tests

- Owner subscribes, paid invoice grants credits, member starts job, worker finalizes, unused credits return, dashboard shows settlement
- Owner buys top-up, duplicate webhook arrives, credits grant once
- Failed AI job releases reservation
- Insufficient-credit request does not create runnable work
- Ordinary workspace user cannot reach platform administration

## Operational Notes

- Process only required Stripe event types and store event IDs to reject duplicate delivery.
- Keep webhook responses fast by storing verified inbox records before reconciliation.
- Run scheduled processors for pending Stripe events, pending AI dispatch rows, expiring grants, unresolved callbacks, and stale worker claims.
- Add dashboards and alerts for pending-event age, undispatched-job age, stale-claim count, callback retry count, unresolved balances, and failed settlements.
- Preserve append-only financial history. Corrections are new ledger entries, never edits.

## Post-Design Constitution Re-Check

- Workspace isolation remains explicit for every workspace-owned entity and route.
- AI cannot directly change billing or wallet state; the financial callback contract is narrowly scoped and idempotent.
- Frontend and backend table ownership is documented and migrations do not overlap.
- The first vertical slice uses real persisted data and defers speculative multi-agent and overage-billing complexity.
- Tests, logs, migrations, rollback considerations, and predictable errors are included as release gates.

## Complexity Tracking

No constitution violations require exceptions.
