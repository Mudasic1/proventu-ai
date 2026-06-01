# Tasks: Subscription Credits and AI Jobs

**Input**: Design documents from `/specs/002-subscription-credit-jobs/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: Required. This feature handles payments, wallet balances, background execution, and platform-operator privileges. Write failing tests before the corresponding implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as an incremental vertical slice. Shared financial infrastructure is intentionally foundational because all stories depend on the same non-negative wallet invariants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it targets different files and does not depend on an incomplete task in the same phase
- **[Story]**: Maps the task to a user story from [spec.md](./spec.md)
- Every task includes an exact target file path

## Phase 1: Setup

**Purpose**: Add dependencies, server-only configuration, and service scaffolds required by both applications.

- [ ] T001 Add Stripe, transaction-capable Neon Drizzle, test-fixture, and browser-test dependencies and scripts in `frontend/package.json`
- [ ] T002 Add FastAPI, SQLModel, SQLAlchemy, psycopg, httpx, pydantic-settings, pytest, and Ruff dependencies plus API and worker scripts in `backend-ai/pyproject.toml`
- [ ] T003 [P] Extend server-only billing, internal HMAC, scheduler, and transaction database environment validation in `frontend/src/lib/env/server.ts` and document variables in `frontend/.env.example`
- [ ] T004 [P] Add backend database, frontend callback, HMAC, worker lease, and logging configuration in `backend-ai/app/core/config.py` and document variables in `backend-ai/.env.example`
- [ ] T005 [P] Add the backend package scaffold, health route, predictable error envelope, and structured logging bootstrap in `backend-ai/app/main.py`, `backend-ai/app/api/routes/health.py`, `backend-ai/app/core/errors.py`, and `backend-ai/app/core/logging.py`
- [ ] T006 [P] Add test harness foundations for frontend integration fixtures and backend database fixtures in `frontend/tests/integration/setup.ts` and `backend-ai/tests/conftest.py`
- [ ] T007 Verify root and project ignore patterns cover Node.js, Python, test, build, and environment artifacts in `.gitignore`, `frontend/.gitignore`, and `backend-ai/.gitignore`

**Checkpoint**: Dependencies and configuration are ready without changing financial behavior.

---

## Phase 2: Foundational Financial and Runtime Infrastructure

**Purpose**: Create the blocking schema, transaction helpers, authorization boundaries, and typed service primitives required by every user story.

**CRITICAL**: No user story implementation begins until this phase passes its schema, arithmetic, transaction, and authorization tests.

### Tests for Foundational Infrastructure

- [ ] T008 [P] Add pricing arithmetic tests for integer micro-USD conversion, markup, ceiling behavior, and inactive pricing rejection in `frontend/tests/unit/model-pricing.test.ts`
- [ ] T009 [P] Add financial invariant tests for non-negative balances, immutable operation keys, lock ordering assumptions, and expiry-after-release behavior in `frontend/tests/unit/credit-invariants.test.ts`
- [ ] T010 [P] Add internal HMAC authentication tests for valid, invalid, and stale signatures in `frontend/tests/unit/internal-hmac.test.ts` and `backend-ai/tests/unit/test_internal_hmac.py`
- [ ] T011 [P] Add platform-administrator authorization tests that prove workspace roles do not grant operator access in `frontend/tests/integration/platform-admin-permissions.test.ts`
- [ ] T012 [P] Add schema ownership tests that reject overlapping frontend and backend table ownership in `frontend/tests/unit/schema-ownership.test.ts`

### Implementation for Foundational Infrastructure

- [ ] T013 Add frontend-owned billing, wallet, pricing, request, rate-limit, and operator tables with constraints and indexes in `frontend/src/lib/db/schema.ts`
- [ ] T014 Generate and review the frontend financial schema migration in `frontend/drizzle/0002_subscription_credit_jobs.sql`
- [ ] T015 [P] Add the transaction-capable Neon WebSocket Drizzle connection beside the existing read connection in `frontend/src/lib/db/transaction.ts`
- [ ] T016 [P] Add frontend billing, credit, pricing, job, admin, and internal-boundary validation schemas in `frontend/src/lib/validations/billing.ts`, `frontend/src/lib/validations/credits.ts`, `frontend/src/lib/validations/ai-jobs.ts`, `frontend/src/lib/validations/admin.ts`, and `frontend/src/lib/validations/internal.ts`
- [ ] T017 [P] Implement deterministic integer model-price selection, estimation, and settlement helpers in `frontend/src/lib/pricing/model-pricing.ts`
- [ ] T018 [P] Implement server-only HMAC signing and verification helpers in `frontend/src/lib/security/internal-hmac.ts` and `backend-ai/app/core/internal_hmac.py`
- [ ] T019 [P] Add workspace-owner permission helpers and separate platform-administrator permission helpers in `frontend/src/lib/permissions/billing.ts` and `frontend/src/lib/permissions/platform-admin.ts`
- [ ] T020 Implement wallet locking, operation-key replay protection, grant allocation, immutable ledger insertion, expiration handling, reservation, settlement, release, reversal, unresolved-shortfall, and manual-adjustment primitives in `frontend/src/server/services/credit-wallet.ts`
- [ ] T021 [P] Add backend-owned runtime SQLModel entities for job runs, claims, usage, and worker events in `backend-ai/app/db/models/ai_runtime.py`
- [ ] T022 [P] Add backend database session management and migration bootstrap in `backend-ai/app/db/session.py`, `backend-ai/app/db/migrations/0001_ai_runtime.sql`, and `backend-ai/app/db/migrate.py`
- [ ] T023 [P] Add shared safe logging metadata helpers and redaction rules in `frontend/src/lib/logging/operations.ts` and `backend-ai/app/core/redaction.py`
- [ ] T024 Run the foundational unit and integration suites and record the checkpoint result in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Wallet primitives enforce non-negative balances and append-only history; backend runtime schema is isolated behind typed internal boundaries.

---

## Phase 3: User Story 1 - Subscribe a Workspace and Receive Monthly Credits (Priority: P1) MVP

**Goal**: Let a workspace owner subscribe through Stripe-hosted Checkout and receive one monthly credit grant after verified paid-invoice reconciliation.

**Independent Test**: An owner completes subscription Checkout; verified webhook events are stored and reconciled; the workspace subscription becomes active and exactly one expiring monthly grant plus matching ledger entry exists after duplicate delivery.

### Tests for User Story 1

- [ ] T025 [P] [US1] Add checkout and portal route contract tests for owner authorization, local request idempotency, and redirect-only success behavior in `frontend/tests/integration/billing-checkout.test.ts`
- [ ] T026 [P] [US1] Add webhook route tests for raw-body signature verification, invalid rejection, accepted duplicate delivery, and durable inbox insertion in `frontend/tests/integration/stripe-webhook.test.ts`
- [ ] T027 [P] [US1] Add subscription reconciliation tests for `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, duplicate invoices, and out-of-order delivery in `frontend/tests/integration/subscription-reconciliation.test.ts`
- [ ] T028 [P] [US1] Add monthly grant transaction tests for expiration dates, immutable ledger entries, and duplicate operation keys in `frontend/tests/integration/monthly-credit-grants.test.ts`

### Implementation for User Story 1

- [ ] T029 [US1] Implement Stripe client creation, server-side idempotency keys, Checkout Session creation, and customer portal session creation in `frontend/src/lib/billing/stripe-client.ts` and `frontend/src/server/services/billing-checkout.ts`
- [ ] T030 [US1] Implement owner-only subscription Checkout and billing portal route handlers in `frontend/src/app/api/billing/checkout/subscription/route.ts` and `frontend/src/app/api/billing/portal/route.ts`
- [ ] T031 [US1] Implement raw-body Stripe signature verification and durable unique webhook inbox insertion in `frontend/src/app/api/stripe/webhook/route.ts` and `frontend/src/server/services/stripe-webhook-inbox.ts`
- [ ] T032 [US1] Implement subscription lifecycle reconciliation, canonical Stripe object retrieval, paid-invoice monthly grant creation, and safe payment records in `frontend/src/server/services/stripe-event-processor.ts`
- [ ] T033 [US1] Implement scheduler-authenticated pending Stripe event processing with retry and dead-letter handling in `frontend/src/app/api/internal/billing/process-events/route.ts`
- [ ] T034 [P] [US1] Add workspace billing queries for plan catalog, current subscription, payment history, and monthly entitlement summary in `frontend/src/server/queries/billing.ts`
- [ ] T035 [US1] Add safe billing event logs and operator audit entries in `frontend/src/server/services/stripe-event-processor.ts`
- [ ] T036 [US1] Run the US1 test suite and mark the billing implementation checkpoint in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: A paid subscription grants monthly credits exactly once from verified invoice payment and supports owner-only self-service billing management.

---

## Phase 4: User Story 2 - Buy Top-Up Credits (Priority: P1)

**Goal**: Let an owner of an active paid workspace buy one-time credits and reverse them safely for refunds or disputes.

**Independent Test**: An active paid workspace buys a top-up, receives one non-expiring grant after confirmed payment, ignores duplicate delivery, and records a safe reversal or unresolved balance after refund.

### Tests for User Story 2

- [ ] T037 [P] [US2] Add top-up route tests for owner authorization, active-subscription eligibility, local request idempotency, and hosted Checkout creation in `frontend/tests/integration/top-up-checkout.test.ts`
- [ ] T038 [P] [US2] Add top-up reconciliation tests for paid Checkout, delayed success, delayed failure, duplicate fulfillment, refund, dispute, and unresolved-balance behavior in `frontend/tests/integration/top-up-reconciliation.test.ts`
- [ ] T039 [P] [US2] Add grant-provenance tests that consume earliest-expiring monthly credits before non-expiring top-ups in `frontend/tests/integration/credit-grant-ordering.test.ts`

### Implementation for User Story 2

- [ ] T040 [US2] Add owner-only top-up Checkout creation and active-paid-subscription eligibility rules in `frontend/src/server/services/billing-checkout.ts` and `frontend/src/app/api/billing/checkout/top-up/route.ts`
- [ ] T041 [US2] Extend Stripe event reconciliation for top-up fulfillment, delayed payment outcomes, refunds, disputes, append-only reversals, and unresolved spending blocks in `frontend/src/server/services/stripe-event-processor.ts`
- [ ] T042 [P] [US2] Add top-up catalog and purchase-history queries in `frontend/src/server/queries/billing.ts`
- [ ] T043 [US2] Run the US2 test suite and mark the top-up checkpoint in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Top-ups grant once, remain attributable, and reverse without negative balances.

---

## Phase 5: User Story 3 - Reserve and Settle AI Job Credits (Priority: P1)

**Goal**: Create idempotent workspace AI requests that reserve estimated credits before dispatch and settle measured token usage without overcharging or negative balances.

**Independent Test**: A member creates a priced AI request, credits reserve atomically, repeated request keys return the same job, successful finalization settles measured usage, unused reservation returns, and insufficient credit creates no runnable work.

### Tests for User Story 3

- [ ] T044 [P] [US3] Add AI-job validation and pricing estimate tests for configured models, inactive models, and client-calculated-credit rejection in `frontend/tests/unit/ai-job-validation.test.ts`
- [ ] T045 [P] [US3] Add concurrent reservation tests that prove near-boundary requests cannot overspend a workspace wallet in `frontend/tests/integration/credit-reservations.test.ts`
- [ ] T046 [P] [US3] Add AI-job request tests for request-key replay, `queued`, `insufficient_credits`, spending-blocked, and no-outbox-on-rejection behavior in `frontend/tests/integration/ai-job-requests.test.ts`
- [ ] T047 [P] [US3] Add finalization callback tests for completed settlement, pricing snapshots, unused-credit release, replay safety, conflicting terminal callback rejection, and shortfall recording in `frontend/tests/integration/ai-job-finalization.test.ts`

### Implementation for User Story 3

- [ ] T048 [US3] Implement AI-job request creation with server-side pricing lookup, rate-limit hook, wallet reservation, insufficient-credit record, and durable dispatch outbox in `frontend/src/server/services/ai-job-requests.ts`
- [ ] T049 [US3] Implement workspace-scoped AI-job creation route with predictable errors and request-key replay behavior in `frontend/src/app/api/ai/jobs/route.ts`
- [ ] T050 [US3] Implement signed worker finalization callback with frontend recomputation, atomic settlement, release, replay protection, conflict rejection, and shortfall handling in `frontend/src/app/api/internal/ai-jobs/[jobId]/finalize/route.ts` and `frontend/src/server/services/ai-job-finalization.ts`
- [ ] T051 [P] [US3] Add workspace AI-job list and detail queries with cursor pagination and safe summaries in `frontend/src/server/queries/ai-jobs.ts`
- [ ] T052 [P] [US3] Add scheduler-authenticated credit expiration processing for unreserved monthly grants in `frontend/src/app/api/internal/credits/expire/route.ts` and `frontend/src/server/services/credit-expiration.ts`
- [ ] T053 [US3] Run the US3 test suite and mark the reservation and settlement checkpoint in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: AI requests reserve before execution and settle exactly once from measured usage.

---

## Phase 6: User Story 4 - Run Jobs Safely in the Background (Priority: P1)

**Goal**: Execute queued AI work through backend-owned runtime tables, worker leases, bounded retries, cooperative cancellation, and retried frontend callbacks.

**Independent Test**: One queued request dispatches once, concurrent workers claim it once, stale claims recover within policy, failure and cancellation callbacks release valid credits once, and callback retries do not duplicate settlement.

### Tests for User Story 4

- [ ] T054 [P] [US4] Add backend enqueue and cancel contract tests for HMAC authentication, idempotent enqueue, and cancellation replay in `backend-ai/tests/integration/test_job_api.py`
- [ ] T055 [P] [US4] Add worker repository tests for `FOR UPDATE SKIP LOCKED`, concurrent claim contention, leases, heartbeat, stale recovery, and bounded retries in `backend-ai/tests/integration/test_job_claims.py`
- [ ] T056 [P] [US4] Add worker execution tests for completion usage, provider failure, cooperative cancellation, safe summaries, and callback retry scheduling in `backend-ai/tests/integration/test_worker_execution.py`
- [ ] T057 [P] [US4] Add frontend dispatch outbox tests for HMAC calls, enqueue replay, retry scheduling, and dead-letter behavior in `frontend/tests/integration/ai-job-dispatch.test.ts`
- [ ] T058 [P] [US4] Add frontend cancellation tests for workspace authorization, cancellable states, backend propagation, and idempotent final release in `frontend/tests/integration/ai-job-cancellation.test.ts`

### Implementation for User Story 4

- [ ] T059 [US4] Implement backend runtime repositories for enqueue, claim, heartbeat, retry, cancellation, usage, and worker events in `backend-ai/app/db/repositories/ai_jobs.py`
- [ ] T060 [US4] Implement HMAC-protected enqueue and cancellation API routes with typed envelopes in `backend-ai/app/api/routes/jobs.py` and `backend-ai/app/schemas/jobs.py`
- [ ] T061 [US4] Implement frontend dispatch outbox claiming, signed backend enqueue calls, retry scheduling, and dead-letter logging in `frontend/src/server/services/ai-job-dispatch.ts` and `frontend/src/app/api/internal/ai-jobs/dispatch/route.ts`
- [ ] T062 [US4] Implement backend signed frontend callback client with replay-safe retry scheduling in `backend-ai/app/services/frontend_callback.py`
- [ ] T063 [US4] Implement worker claim loop, lease heartbeat, bounded retry policy, cooperative cancellation, provider adapter boundary, measured usage capture, and finalization delivery in `backend-ai/app/worker/main.py`, `backend-ai/app/worker/executor.py`, and `backend-ai/app/services/provider_adapter.py`
- [ ] T064 [US4] Implement workspace-scoped cancellation route and signed backend cancellation propagation in `frontend/src/app/api/ai/jobs/[jobId]/cancel/route.ts` and `frontend/src/server/services/ai-job-cancellation.ts`
- [ ] T065 [US4] Run the US4 frontend and backend suites and mark the worker-safety checkpoint in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Background work survives retries and worker crashes without duplicate claims or duplicate wallet finalization.

---

## Phase 7: User Story 5 - Review Balance, Usage, Jobs, and Billing (Priority: P2)

**Goal**: Give workspace members transparent usage and job visibility while keeping billing actions owner-only.

**Independent Test**: A workspace member sees balances, reservations, ledger activity, and job details; a workspace owner additionally sees plan, top-ups, payment history, and billing actions.

### Tests for User Story 5

- [ ] T066 [P] [US5] Add usage summary and ledger query tests for workspace isolation, pagination, current-period metrics, and low-balance states in `frontend/tests/integration/usage-dashboard.test.ts`
- [ ] T067 [P] [US5] Add AI-job list and detail query tests for workspace isolation, status filters, safe errors, and pagination in `frontend/tests/integration/ai-job-dashboard.test.ts`
- [ ] T068 [P] [US5] Add billing-settings tests that prove members can view usage but only owners can start Checkout or portal sessions in `frontend/tests/integration/billing-settings-permissions.test.ts`

### Implementation for User Story 5

- [ ] T069 [P] [US5] Add workspace usage summary and paginated ledger queries in `frontend/src/server/queries/usage.ts`
- [ ] T070 [P] [US5] Add wallet summary card and low-balance guidance to the existing revenue dashboard in `frontend/src/server/queries/dashboard.ts` and `frontend/src/app/(dashboard)/dashboard/page.tsx`
- [ ] T071 [P] [US5] Build the usage overview and ledger-history components in `frontend/src/components/usage/usage-summary.tsx`, `frontend/src/components/usage/ledger-list.tsx`, and `frontend/src/app/(dashboard)/usage/page.tsx`
- [ ] T072 [P] [US5] Build AI-job list, filters, and safe detail views in `frontend/src/components/ai-jobs/job-list.tsx`, `frontend/src/app/(dashboard)/ai/jobs/page.tsx`, and `frontend/src/app/(dashboard)/ai/jobs/[jobId]/page.tsx`
- [ ] T073 [P] [US5] Build owner-aware billing settings with plan, renewal, top-up, payment-history, Checkout, and portal controls in `frontend/src/components/billing/billing-settings.tsx` and `frontend/src/app/(dashboard)/settings/billing/page.tsx`
- [ ] T074 [US5] Add usage, AI-jobs, and billing navigation destinations in `frontend/src/components/dashboard/dashboard-shell.tsx`
- [ ] T075 [US5] Run the US5 integration suite and verify the dashboard states against `specs/002-subscription-credit-jobs/quickstart.md`

**Checkpoint**: Workspace users can understand paid AI usage without support assistance.

---

## Phase 8: User Story 6 - Operate Plans, Pricing, Wallets, and Failures (Priority: P2)

**Goal**: Give internal platform administrators controlled, auditable operations tools without direct database edits.

**Independent Test**: A platform billing administrator creates a future-effective model price, searches a wallet trail, performs a reasoned adjustment, and investigates a failed payment or AI job while an ordinary workspace owner remains forbidden.

### Tests for User Story 6

- [ ] T076 [P] [US6] Add platform-admin catalog and pricing tests for role permissions, effective dates, historical preservation, and overlapping price rejection in `frontend/tests/integration/admin-catalog-pricing.test.ts`
- [ ] T077 [P] [US6] Add manual-adjustment tests for reason requirement, immutable ledger entry, audit entry, operation-key replay, and negative-adjustment rejection in `frontend/tests/integration/admin-wallet-adjustments.test.ts`
- [ ] T078 [P] [US6] Add admin search-query tests for payment events, refunds, disputes, unresolved balances, AI-job failures, and workspace isolation in `frontend/tests/integration/admin-operations-queries.test.ts`

### Implementation for User Story 6

- [ ] T079 [US6] Implement platform-admin catalog, top-up, and future-effective model-pricing services with overlap validation and audit entries in `frontend/src/server/services/admin-catalog.ts` and `frontend/src/server/services/admin-model-pricing.ts`
- [ ] T080 [US6] Implement reason-required platform-admin wallet adjustment service using wallet primitives and append-only audit entries in `frontend/src/server/services/admin-wallet-adjustments.ts`
- [ ] T081 [P] [US6] Add platform-admin overview, catalog, pricing, wallet, payment-event, refund, dispute, job-failure, and audit queries in `frontend/src/server/queries/admin-operations.ts`
- [ ] T082 [US6] Add platform-admin route handlers for catalogs, pricing, wallet adjustments, overview, payment events, AI jobs, and audit in `frontend/src/app/api/admin/`
- [ ] T083 [P] [US6] Build the platform-operations shell and overview page in `frontend/src/components/admin/admin-shell.tsx` and `frontend/src/app/(dashboard)/admin/page.tsx`
- [ ] T084 [P] [US6] Build platform-admin plans, top-ups, pricing, wallet, payments, jobs, and audit pages in `frontend/src/app/(dashboard)/admin/plans/page.tsx`, `frontend/src/app/(dashboard)/admin/top-ups/page.tsx`, `frontend/src/app/(dashboard)/admin/model-pricing/page.tsx`, `frontend/src/app/(dashboard)/admin/wallets/page.tsx`, `frontend/src/app/(dashboard)/admin/payments/page.tsx`, `frontend/src/app/(dashboard)/admin/ai-jobs/page.tsx`, and `frontend/src/app/(dashboard)/admin/audit/page.tsx`
- [ ] T085 [US6] Run the US6 integration suite and verify operator access separation in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Support and billing operators have auditable recovery paths without unsafe direct data edits.

---

## Phase 9: User Story 7 - Protect AI Job Creation from Abuse (Priority: P2)

**Goal**: Reject abusive or accidental AI-job bursts before reservation while preserving auditable rate-limit decisions.

**Independent Test**: User, workspace, and job-type limits reject excess requests before wallet reservation or backend dispatch and provide safe retry guidance.

### Tests for User Story 7

- [ ] T086 [P] [US7] Add fixed-window rate-limit unit tests for user, workspace, and workspace-job-type buckets plus retry guidance in `frontend/tests/unit/ai-job-rate-limit.test.ts`
- [ ] T087 [P] [US7] Add integration tests proving rejected AI-job requests create an audit decision but no reservation, runnable job, or backend dispatch row in `frontend/tests/integration/ai-job-rate-limit.test.ts`
- [ ] T088 [P] [US7] Add platform-admin rate-limit activity query tests in `frontend/tests/integration/admin-rate-limit-queries.test.ts`

### Implementation for User Story 7

- [ ] T089 [US7] Implement atomic pre-reservation rate-limit bucket evaluation and auditable decisions in `frontend/src/server/services/ai-job-rate-limit.ts`
- [ ] T090 [US7] Wire user, workspace, and job-type rate limits into AI-job creation before wallet reservation in `frontend/src/server/services/ai-job-requests.ts`
- [ ] T091 [P] [US7] Add platform-admin rate-limit activity queries and overview metrics in `frontend/src/server/queries/admin-operations.ts`
- [ ] T092 [US7] Run the US7 test suite and mark the abuse-protection checkpoint in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Excess job creation is rejected before it can consume credits or worker capacity.

---

## Phase 10: Polish and Cross-Cutting Release Gates

**Purpose**: Validate the full paid-usage lifecycle, document operations, and prevent regression.

- [ ] T093 [P] Add critical browser flow for subscription grant, top-up grant, job reservation, worker settlement, usage dashboard, and billing permissions in `frontend/tests/e2e/subscription-credit-jobs.spec.ts`
- [ ] T094 [P] Add cross-workspace regression coverage for wallets, ledger rows, purchases, subscriptions, AI jobs, usage summaries, and admin boundaries in `frontend/tests/integration/subscription-credit-workspace-isolation.test.ts`
- [ ] T095 [P] Add redaction regression tests for Stripe errors, internal signatures, provider request IDs, prompts, outputs, and worker logs in `frontend/tests/unit/operations-redaction.test.ts` and `backend-ai/tests/unit/test_redaction.py`
- [ ] T096 Add scheduled reconciliation coverage for pending Stripe inbox rows, pending dispatch rows, expiring grants, stale worker claims, and callback retry dead letters in `frontend/tests/integration/reconciliation-jobs.test.ts` and `backend-ai/tests/integration/test_reconciliation.py`
- [ ] T097 [P] Document migration order, rollback boundaries, Stripe test-mode setup, reconciliation procedures, alert signals, and support playbooks in `specs/002-subscription-credit-jobs/runbook.md`
- [ ] T098 Review frontend and backend migrations against the ownership contract and record the result in `specs/002-subscription-credit-jobs/checklists/implementation.md`
- [ ] T099 Run frontend `npm run lint`, `npm run typecheck`, and `npm test` from `frontend/package.json`
- [ ] T100 Run backend `pytest` and `ruff check .` from `backend-ai/pyproject.toml`
- [ ] T101 Run the complete verification sequence in `specs/002-subscription-credit-jobs/quickstart.md`
- [ ] T102 Review logs, audit entries, workspace scope, AI approval boundaries, deferred scope, and all implementation checklist items in `specs/002-subscription-credit-jobs/checklists/implementation.md`

**Checkpoint**: Production release gates pass with auditable financial behavior and no unresolved checklist items.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Setup and blocks every user story.
- **Phase 3 US1 Subscription**: Depends on Foundational.
- **Phase 4 US2 Top-Ups**: Depends on Foundational and reuses the Stripe inbox, wallet, and Checkout services proven by US1.
- **Phase 5 US3 Reserve and Settle**: Depends on Foundational. It can begin in parallel with US1 after wallet primitives pass, but the recommended sequence completes US1 first.
- **Phase 6 US4 Worker Execution**: Depends on US3 request, reservation, outbox, and finalization contracts.
- **Phase 7 US5 User Dashboards**: Depends on US1 through US4 so screens are backed by real billing and usage data.
- **Phase 8 US6 Platform Operations**: Depends on Foundational and benefits from US1 through US4 operational records.
- **Phase 9 US7 Abuse Protection**: Depends on the US3 job-request service and can run in parallel with US5 and US6.
- **Phase 10 Polish**: Depends on all desired stories.

### User Story Dependencies

- **US1 Subscribe Workspace**: First deployable revenue slice after Foundational.
- **US2 Buy Top-Ups**: Reuses US1 Stripe and wallet foundations but remains independently testable through one-time purchase fixtures.
- **US3 Reserve and Settle Credits**: Reuses Foundational wallet services and can be validated with seeded grants before Stripe is connected.
- **US4 Background Worker**: Requires US3 outbox and finalization contracts.
- **US5 User Dashboards**: Requires persisted data from US1 through US4; no fake metrics.
- **US6 Platform Operations**: Can start after Foundational for catalog work, but wallet and job investigation views require US1 through US4 records.
- **US7 Abuse Protection**: Requires US3 request creation and runs before reservation.

### Within Each User Story

- Write tests first and confirm they fail for the intended missing behavior.
- Add schema and service primitives before route handlers.
- Add route handlers before UI.
- Run the story suite and mark the story checkpoint before moving forward.
- Never bypass frontend-owned wallet services from backend worker code.

---

## Parallel Opportunities

### Setup

```text
T003 frontend environment validation
T004 backend configuration
T005 backend scaffold
T006 test harnesses
```

### Foundational

```text
T008 pricing tests
T009 invariant tests
T010 HMAC tests
T011 platform-admin authorization tests
T012 schema ownership tests
```

After T013 and T014:

```text
T015 frontend transaction connection
T016 validation schemas
T017 pricing helpers
T018 HMAC helpers
T019 permission helpers
T021 backend runtime entities
T022 backend migration bootstrap
T023 safe logging helpers
```

### User Story 1

```text
T025 checkout and portal tests
T026 webhook route tests
T027 subscription reconciliation tests
T028 monthly grant tests
```

### User Story 3

```text
T044 AI-job validation tests
T045 concurrent reservation tests
T046 request-idempotency tests
T047 finalization tests
```

### User Story 4

```text
T054 backend API tests
T055 claim contention tests
T056 worker execution tests
T057 frontend dispatch tests
T058 cancellation tests
```

### User Story 5

```text
T071 usage UI
T072 AI-job UI
T073 billing UI
```

### User Story 6

```text
T083 admin shell
T084 admin pages
```

### Polish

```text
T093 browser flow
T094 workspace isolation regression
T095 redaction regression
T097 runbook
```

---

## Implementation Strategy

### MVP First

The safest MVP is not only US1. It is the smallest paid-usage path:

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete US1 subscription grant.
4. Complete US3 reservation and settlement with seeded worker finalization.
5. Validate wallet invariants before connecting real provider execution.

This proves money enters through a verified payment and leaves through a measured, auditable AI usage path.

### Incremental Delivery

1. Add US2 top-ups and reversal handling.
2. Add US4 worker execution and crash recovery.
3. Add US5 self-service workspace dashboards.
4. Add US6 operator tooling.
5. Add US7 rate limiting.
6. Complete release gates.

### Parallel Team Strategy

After Foundational:

- Developer A: Stripe subscription and top-up reconciliation
- Developer B: AI-job reservation, outbox, and finalization
- Developer C: Backend runtime queue and worker scaffold after US3 contracts stabilize
- Developer D: Workspace dashboards and platform-admin UI once query contracts stabilize

---

## Notes

- Preserve the unrelated working-tree changes in `frontend/src/server/mutations/workspaces.ts`, `skills-lock.json`, and `.agents/skills/stripe-best-practices/`.
- Use reviewed migrations only. Do not manually mutate production schema.
- Keep provider/model prices in `model_pricing`; do not hardcode model prices.
- Treat missing workspace scope, duplicate financial application, negative balances, and unsigned internal calls as release-blocking defects.
- Treat Stripe redirect pages as navigation only.
- Store safe summaries and identifiers, not unnecessary prompts, outputs, secrets, signatures, cookies, or raw unrestricted webhook payloads.
- Commit after each task or cohesive task group and stop at every story checkpoint for validation.
