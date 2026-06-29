# Research and Planning Handoff: Subscription Credits and AI Jobs

**Created**: 2026-05-31  
**Status**: Ready for `/speckit-plan`

## Existing Project Analysis

### Product Context

The root `README.md` defines Proventu AI as an agentic sales and marketing workspace for small businesses and agencies. It already identifies:

- A workspace-oriented product model
- A user dashboard with revenue priorities and activity
- A billing settings destination
- AI agents, AI task history, approval controls, and traceability as roadmap needs
- Paid plans with different AI-usage levels

The requested subscription and credit system is the paid-usage foundation for those roadmap features. It should extend the current product instead of introducing a parallel account model.

### Existing Frontend Architecture

The `frontend/` application already owns:

- Better Auth user sessions
- Workspace and workspace-member records
- Business profiles and offers
- CRM contacts and imports
- Pipeline stages, deals, follow-up tasks, and activity entries
- Workspace-scoped queries, mutations, and a protected dashboard shell
- Drizzle schema and migrations

Important constraints from the current code:

- The existing schema and query layer consistently scope product records by `workspaceId`.
- The existing dashboard is a revenue-workspace dashboard, not a platform-operations dashboard.
- The existing `workspace_member.role` field supports an initial owner-only billing rule.
- The existing dashboard navigation has room for user-facing usage and billing destinations.
- The working tree already contains an unrelated modification in `frontend/src/server/mutations/workspaces.ts`; implementation planning must preserve it.

### Existing AI Backend Architecture

The `backend-ai/` application is currently only a Python scaffold. No queue, worker, AI runtime model, pricing model, or usage-settlement behavior exists yet.

The Phase 1 planning artifacts define a useful ownership boundary:

- Frontend migrations own shared business tables.
- Backend-owned AI tables use an `ai_*` naming convention.
- Long-running AI work should move to asynchronous execution.
- AI behavior must be auditable and workspace-scoped.

The detailed plan should decide the minimum shared records the frontend owns for billing and wallet display and the runtime records the worker owns for safe execution, without allowing two migration systems to compete for the same tables.

## Dashboard Inventory

### Required Workspace User Surfaces

1. **Existing Revenue Dashboard Extension**
   - Available-credit summary
   - Reserved-credit summary
   - Low-balance warning
   - Link to usage details

2. **Usage Dashboard**
   - Spendable and reserved credits
   - Current-period usage
   - Monthly entitlement renewal
   - Top-up balance
   - Ledger history
   - Low-balance and blocked-spending states

3. **AI Jobs Dashboard**
   - Filterable status list
   - Job detail
   - Estimated, final, and released credits
   - Safe failure summary
   - Retry and cancellation visibility where appropriate

4. **Billing Settings**
   - Current plan
   - Renewal state
   - Included monthly credits
   - Top-up packages
   - Payment history
   - Owner-only checkout and billing-management actions

### Required Platform Admin Surfaces

1. **Operations Overview**
   - Payment-processing health
   - Wallet liabilities
   - Unresolved balances
   - Job throughput and failures
   - Refund and rate-limit signals

2. **Plan and Top-Up Catalog**
   - Availability
   - Effective dates
   - Historical preservation

3. **Model Pricing**
   - Provider
   - Model
   - Input-token cost
   - Output-token cost
   - Markup
   - Credit conversion
   - Future-effective changes

4. **Workspace Wallet Operations**
   - Wallet lookup
   - Ledger inspection
   - Reasoned manual adjustments
   - Unresolved reversal review

5. **Payments and Events**
   - Subscription and top-up payments
   - Payment-notification processing
   - Refunds
   - Disputes
   - Failures

6. **AI Job Operations**
   - Job lookup
   - Claims
   - Retries
   - Cancellations
   - Usage settlement

7. **Audit Log**
   - Administrator actions
   - Sensitive operational actions

## Stripe Subscription Research

The specification uses these current Stripe recommendations:

1. **Create Checkout Sessions on the server**
   - Use Checkout subscription mode for recurring plans.
   - Use Checkout payment mode for one-time top-up purchases.
   - Keep product and workspace reconciliation metadata on server-created purchase records.

2. **Use webhooks as the payment authority**
   - Do not grant credits from the success-page redirect.
   - Fulfill only after the applicable successful payment confirmation.
   - Handle delayed payment methods when enabled.

3. **Verify webhook signatures**
   - Reject unverified payloads before changing billing or wallet state.
   - Preserve the raw request body needed for signature verification.

4. **Design for retries and out-of-order events**
   - Record processed event identities.
   - Make grants, reversals, and transitions idempotent.
   - Reconcile against related subscription, invoice, payment, and local purchase state instead of assuming event order.

5. **Use the hosted customer portal for self-service billing**
   - Let owners manage supported payment-method, invoice, cancellation, and subscription actions through the billing portal.
   - Keep internal wallet and credit-ledger behavior inside Proventu AI.

### Primary Sources

- [Stripe Checkout subscriptions](https://docs.stripe.com/payments/checkout/build-subscriptions)
- [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature)
- [Stripe webhook behavior and duplicate handling](https://docs.stripe.com/webhooks)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe customer portal integration](https://docs.stripe.com/customer-management/integrate-customer-portal)

## Planning Sequence

The detailed implementation plan should be created before coding and should preserve the existing frontend ownership model.

1. **Define Ownership and Contracts**
   - Decide shared billing, wallet, ledger, pricing, AI-job, event, and audit records.
   - Define frontend-to-worker contracts and status transitions.
   - Define workspace-owner and platform-administrator authorization boundaries.

2. **Build Wallet Safety First**
   - Add wallet, grants, immutable ledger, reservations, releases, settlement, reversals, and non-negative invariants.
   - Cover concurrency and retry behavior before connecting checkout or AI workers.

3. **Add Payment Integration**
   - Add plan and top-up catalog.
   - Add server-side checkout initiation.
   - Add verified and idempotent payment processing.
   - Add subscription renewal, cancellation, refund, and dispute reconciliation.

4. **Add Configurable Pricing**
   - Add effective-dated provider/model pricing.
   - Add estimation and historical pricing snapshots.
   - Reject unsupported or inactive model choices before queueing.

5. **Add Background AI Jobs**
   - Add idempotent job creation and reservation.
   - Add worker claims, stale recovery, bounded retries, cancellation, and exactly-once financial finalization.
   - Add safe usage and failure logs.

6. **Build User Dashboards**
   - Extend the revenue dashboard.
   - Add usage, job history, job detail, and billing settings.

7. **Build Platform Administration**
   - Add operations overview.
   - Add catalog, model pricing, wallet adjustment, payment-event, job, refund, and audit views.

8. **Harden and Release**
   - Add rate limiting.
   - Add integration, concurrency, and authorization tests.
   - Add reconciliation and operational runbooks.
   - Verify logs redact secrets and unnecessary user content.

## Planning Risks

- Wallet operations are financial state transitions. Treat transaction boundaries, concurrency, and idempotency as release blockers.
- A browser redirect is not proof of payment. Granting credits from it would allow incorrect balances.
- Monthly grants and top-ups have different expiration behavior. Preserve credit-grant provenance so consumption and reversal decisions remain auditable.
- A worker crash after an external model call can create ambiguous cost. Job claims, idempotent finalization, and unresolved-shortfall handling need explicit design.
- Workspace owners and internal platform administrators are different trust boundaries. Do not overload `workspace_member.role` for platform administration.
- The existing working-tree change in `frontend/src/server/mutations/workspaces.ts` must not be overwritten during implementation.

## Phase 0 Technical Decisions

### Decision: Use Stripe-hosted Checkout and customer portal sessions

**Rationale**: Stripe Checkout supports server-created Sessions for recurring `subscription` mode and one-time `payment` mode. The customer portal provides subscription, payment-detail, and invoice self-service without duplicating billing UI.

**Alternatives considered**:

- Custom card collection: rejected because it expands security scope and duplicates hosted billing behavior.
- Browser-only purchase confirmation: rejected because redirects are not reliable payment authority.

### Decision: Verify webhooks, store a durable inbox row, then reconcile asynchronously

**Rationale**: Stripe requires raw-body signature verification. Stripe also documents duplicate delivery, non-guaranteed event ordering, and asynchronous processing as webhook concerns. A durable inbox lets the route acknowledge quickly while a scheduled processor reconciles canonical Stripe objects and applies idempotent financial changes.

**Alternatives considered**:

- Apply grants directly in the webhook request: rejected because remote retrieval, retries, and concurrent delivery make the request path fragile.
- Store unrestricted raw webhook payloads indefinitely: rejected because the initial slice can retain safe routing metadata and fetch canonical Stripe objects when processing.

### Decision: Grant subscription credits from paid invoices only

**Rationale**: Stripe documents `invoice.paid` for successful recurring billing periods. Checkout completion associates the workspace, customer, and subscription, while the invoice identity becomes the unique monthly-grant source. This prevents a duplicate initial grant.

**Alternatives considered**:

- Grant from both Checkout completion and invoice payment: rejected because it can double-credit the initial billing period.
- Grant at checkout redirect: rejected because the customer may not reach the redirect and redirects are not proof of payment.

### Decision: Preserve credit batches and reservation allocations

**Rationale**: Monthly credits expire while top-ups do not. Grant batches and reservation allocations preserve provenance, enable first-expiring-first-out consumption, make reversals auditable, and define what happens when credits are released after their source grant expired.

**Alternatives considered**:

- Store only one wallet number: rejected because expiration, refunds, disputes, and attribution become ambiguous.
- Expire active reservations at the billing boundary: rejected because it would invalidate already accepted jobs.

### Decision: Use transaction-capable Neon WebSocket connections for wallet services

**Rationale**: Neon documents HTTP as suitable for single, non-interactive transactions and WebSockets for session or interactive transaction support. Wallet operations require row locks, ordered grant allocation, conditional checks, and multiple writes in one transaction. The existing HTTP Drizzle connection remains appropriate for ordinary reads.

**Alternatives considered**:

- Use the existing HTTP connection for all mutations: rejected because the financial path needs interactive transaction semantics and row locking.
- Add a separate database: rejected because it increases reconciliation complexity without improving the first slice.

### Decision: Use Postgres queue tables and `FOR UPDATE SKIP LOCKED`

**Rationale**: PostgreSQL documents `SKIP LOCKED` as useful for multiple consumers accessing a queue-like table. It provides a production-capable initial worker queue without adding Redis or a broker before workload requires one.

**Alternatives considered**:

- Add Redis and a queue framework immediately: deferred because the first slice can meet requirements with Postgres and fewer operational dependencies.
- Execute AI work inside Next.js requests: rejected because long-running work must not block user requests.

### Decision: Separate frontend job requests from backend runtime runs

**Rationale**: The constitution requires one owner per domain. Frontend transactions atomically create the user-facing `ai_job_request`, reservation, and dispatch outbox. Backend workers own `ai_job_run`, claims, and usage records. Signed internal APIs enqueue runtime work and return final usage for frontend-owned settlement.

**Alternatives considered**:

- Allow workers to mutate wallet tables directly: rejected because it duplicates financial business logic across services.
- Let the frontend execute provider calls: rejected because it mixes user-facing request handling with worker orchestration.

### Decision: Use effective-dated integer model pricing

**Rationale**: Token cost, markup, and credit conversion must be configurable. Integer micro-USD values and ceiling arithmetic avoid floating-point drift. Stored pricing snapshots preserve historical settlement.

**Alternatives considered**:

- Hardcode model price constants: rejected by requirement.
- Store decimal floating-point calculations in application memory: rejected because reproducible settlement and auditability require deterministic arithmetic.

## Additional Primary Sources

- [Stripe Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Stripe webhook behavior](https://docs.stripe.com/webhooks?lang=node)
- [Stripe webhook signature verification](https://docs.stripe.com/webhooks/signatures)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe customer portal integration](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Neon serverless driver connection modes](https://neon.com/docs/serverless/serverless-driver)
- [Drizzle transactions](https://orm.drizzle.team/docs/transactions)
- [PostgreSQL `SELECT` locking clause](https://www.postgresql.org/docs/current/sql-select.html)
