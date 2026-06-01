# Feature Specification: Subscription Credits and AI Jobs

**Feature Branch**: `not-created (local artifacts only: 002-subscription-credit-jobs)`  
**Created**: 2026-05-31  
**Status**: Draft  
**Input**: User description: "Implement a production-ready subscription, credit wallet, and background AI job usage system for the SaaS. Research user subscription purchase before creating specs. Include SaaS plans, subscriptions, top-up purchases, verified and idempotent payment handling, a wallet and ledger, reserved credits, actual-usage settlement, refunds, configurable model pricing, dashboards, platform administration, rate limiting, logs, and tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subscribe a Workspace and Receive Monthly Credits (Priority: P1)

As a workspace owner, I want to choose a paid plan and complete a secure checkout so that my workspace receives the plan's monthly AI credits after payment is confirmed.

**Why this priority**: The product cannot offer paid AI usage safely until subscription revenue and monthly credit grants are connected through a trustworthy, auditable flow.

**Independent Test**: A workspace owner completes a subscription purchase, returns to the product, and sees the active plan and exactly one monthly credit grant after payment confirmation.

**Acceptance Scenarios**:

1. **Given** an eligible workspace owner viewing available plans, **When** the owner selects a plan and completes the hosted checkout, **Then** the billing page shows the confirmed subscription after the payment confirmation is processed.
2. **Given** a confirmed initial subscription payment, **When** the payment event is processed, **Then** the workspace wallet receives the plan's monthly included credits exactly once and the ledger records the grant.
3. **Given** a recurring subscription renewal that is paid successfully, **When** the renewal confirmation is processed, **Then** the wallet receives the new billing period's included credits exactly once.
4. **Given** a duplicate or retried payment event, **When** the event is processed again, **Then** the wallet balance and ledger remain unchanged after the first successful processing.
5. **Given** an unverified or malformed payment notification, **When** it is received, **Then** no billing state, wallet balance, or ledger entry changes.
6. **Given** a workspace member without billing permission, **When** the member attempts to start a subscription purchase, **Then** the system prevents the action and explains that owner access is required.

---

### User Story 2 - Buy Top-Up Credits (Priority: P1)

As a workspace owner with an active paid plan, I want to buy additional credits so that my team can continue using AI features after monthly included credits run low.

**Why this priority**: Top-ups prevent avoidable interruptions and create a controlled expansion-revenue path without allowing unverified payment redirects to change balances.

**Independent Test**: An active paid workspace owner buys a top-up package and sees the purchased credits added exactly once only after payment confirmation.

**Acceptance Scenarios**:

1. **Given** an active paid workspace, **When** its owner selects an available top-up package and completes checkout, **Then** the purchased credits are added to the wallet exactly once after payment confirmation.
2. **Given** a top-up checkout that was opened but not paid, **When** the owner returns to the billing page, **Then** the wallet balance remains unchanged.
3. **Given** a duplicate top-up payment event, **When** it is processed again, **Then** the original ledger entry is reused or recognized and the wallet is not credited twice.
4. **Given** a workspace without an active paid plan, **When** its owner attempts to buy a top-up, **Then** the system explains the eligibility requirement and directs the owner to choose a plan.
5. **Given** a reversed, refunded, or disputed top-up payment, **When** the reversal is confirmed, **Then** the system records the reversal, removes remaining attributable credits where possible, prevents a negative spendable balance, and flags any unresolved amount for operator review.

---

### User Story 3 - Reserve and Settle AI Job Credits (Priority: P1)

As an authorized workspace user, I want an AI request to reserve enough credits before work begins and charge only the final calculated usage so that usage is predictable and the workspace is not overcharged.

**Why this priority**: Reservation and settlement are the core safety controls that prevent overspending during asynchronous AI work.

**Independent Test**: A user starts an AI job with sufficient credits, observes a reservation, completes the job with measured usage, and sees only the calculated final charge retained while unused reserved credits are released.

**Acceptance Scenarios**:

1. **Given** an authorized user, an enabled AI job type, a configured model price, and sufficient spendable credits, **When** the user starts a job, **Then** the system creates one queued job and reserves the estimated maximum credits before the job can run.
2. **Given** a queued job with a valid reservation, **When** a worker starts the job, **Then** the job becomes running and no second worker can charge or complete the same job concurrently.
3. **Given** a completed job with recorded input and output token usage, **When** settlement runs, **Then** the final credit charge is calculated from the effective model pricing configuration, the actual credits are deducted, and unused reserved credits are released.
4. **Given** a completed job whose measured cost exceeds the original reservation, **When** settlement runs, **Then** the system charges the additional amount only when enough spendable credits remain; otherwise it records the shortfall for operator review, prevents a negative balance, and preserves the job usage record.
5. **Given** a job that fails or is cancelled before completion, **When** finalization runs, **Then** reserved credits that were not validly consumed are released and the ledger records the release.
6. **Given** a repeated job-creation request with the same request identity, **When** it is received again, **Then** the system returns the original job instead of creating a duplicate reservation.
7. **Given** insufficient spendable credits, **When** a user starts a job, **Then** the job is recorded as `insufficient_credits`, no worker execution begins, and the user receives a clear top-up or plan-upgrade path.

---

### User Story 4 - Run Jobs Safely in the Background (Priority: P1)

As a product operator, I want AI jobs to execute safely in the background with recoverable states so that long-running work does not block users or cause duplicate charges.

**Why this priority**: Reliable background execution is required for expensive AI work and for accurate reservation, settlement, failure, and refund behavior.

**Independent Test**: A queued job is claimed once, retried within its allowed policy after a transient failure, and finalized once with an auditable result.

**Acceptance Scenarios**:

1. **Given** queued jobs, **When** workers request work, **Then** each job is claimable by only one active worker at a time.
2. **Given** a worker interruption after a claim, **When** the claim becomes stale, **Then** the job is recoverable according to its retry policy without creating a second reservation.
3. **Given** a permanently failed job, **When** retry limits are reached, **Then** the job becomes failed, releasable reserved credits are returned, and the failure is logged.
4. **Given** a job cancellation request before completion, **When** cancellation is allowed, **Then** the job becomes cancelled, work stops as soon as safely possible, and unused reserved credits are released.
5. **Given** a completion, failure, cancellation, or insufficient-credit outcome, **When** the job is finalized repeatedly, **Then** the wallet and ledger reflect only one finalization.

---

### User Story 5 - Review Balance, Usage, Jobs, and Billing (Priority: P2)

As a workspace user, I want a clear usage area so that I understand available credits, AI activity, and job outcomes without contacting support.

**Why this priority**: Users need trust and self-service visibility once AI usage has financial value.

**Independent Test**: A user can review wallet balance, reserved credits, recent usage, job statuses, and ledger history, while an owner can additionally manage billing.

**Acceptance Scenarios**:

1. **Given** a workspace with credit activity, **When** an authorized user opens the usage dashboard, **Then** the user sees spendable credits, reserved credits, recent consumption, current-period usage, and recent ledger entries.
2. **Given** AI jobs in different states, **When** the user opens job history, **Then** the user can filter and inspect queued, running, completed, failed, cancelled, and insufficient-credit jobs.
3. **Given** a completed job, **When** the user opens its details, **Then** the user sees estimated credits, final credits, released credits, usage summary, timing, and a safe error summary when applicable.
4. **Given** a workspace owner, **When** the owner opens billing settings, **Then** the owner can review the current plan, renewal state, monthly included credits, top-up options, payment history, and the route to self-service subscription management.
5. **Given** a workspace member without billing permission, **When** the member opens usage, **Then** credit and job visibility is available but payment methods and subscription-management actions remain restricted.

---

### User Story 6 - Operate Plans, Pricing, Wallets, and Failures (Priority: P2)

As a platform administrator, I want an operations panel for plans, model pricing, wallet adjustments, payments, jobs, and failures so that I can manage usage safely without direct data edits.

**Why this priority**: Production operations require controlled recovery paths, auditable support actions, and configurable pricing without redeployment.

**Independent Test**: A platform administrator changes a future-effective model price, performs a manual wallet adjustment with a reason, and investigates a failed job using the admin panel.

**Acceptance Scenarios**:

1. **Given** a platform administrator, **When** the administrator creates or updates a plan or top-up package, **Then** the catalog reflects the configured offering and preserves prior purchase records.
2. **Given** a platform administrator, **When** the administrator creates a future-effective model price, **Then** later jobs use the new effective pricing while historical jobs retain the pricing snapshot used at settlement.
3. **Given** a support-approved credit adjustment, **When** the administrator submits an amount and reason, **Then** the wallet changes through a ledger entry that records actor, reason, time, and related workspace.
4. **Given** an adjustment that would make the spendable balance negative, **When** the administrator submits it, **Then** the system rejects the adjustment or routes it through an explicit unresolved-balance process.
5. **Given** payment, usage, refund, or failure records, **When** an administrator searches operations history, **Then** the administrator can inspect the related workspace, event, job, and ledger trail.
6. **Given** a non-platform user, **When** the user attempts to access platform administration, **Then** the system prevents access and records the denied action where appropriate.

---

### User Story 7 - Protect AI Job Creation from Abuse (Priority: P2)

As a product operator, I want AI job creation to be rate-limited and auditable so that accidental loops and abuse do not exhaust credits or overload workers.

**Why this priority**: Credit checks alone do not protect the service from excessive queued work, repeated retries, or malicious traffic.

**Independent Test**: A user exceeds the configured job-creation limit and receives a recoverable rate-limit response without a job or reservation being created.

**Acceptance Scenarios**:

1. **Given** a user within the allowed rate, **When** the user submits a valid AI request, **Then** normal reservation and job creation proceeds.
2. **Given** a user or workspace above the allowed rate, **When** another AI request is submitted, **Then** the system rejects the request before reservation and explains when retry is appropriate.
3. **Given** an operator investigating abuse, **When** rate-limit activity is reviewed, **Then** the operator can identify the workspace, user, job type, and decision time without viewing secrets.

### Edge Cases

- A checkout browser redirect arrives before its payment confirmation event.
- A payment event is delivered more than once, arrives out of order, or is processed concurrently.
- A subscription changes plan during an active billing period.
- A subscription payment fails, remains unpaid, is cancelled, or reaches the end of its paid period.
- Monthly included credits are granted near a billing-period boundary while jobs are still running.
- A top-up payment is refunded or disputed after some related credits have already been consumed.
- Two users in the same workspace start jobs at the same time near the remaining spendable balance.
- A worker crashes after reserving credits, after an external model request, or during final settlement.
- Token usage is missing, delayed, malformed, or unexpectedly exceeds the reservation.
- A configured model price becomes inactive while an already queued job is running.
- An administrator attempts an adjustment without a reason or with an amount outside the allowed support policy.
- Logs contain user-entered prompts or external-service error details that may include sensitive information.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST maintain a workspace-scoped catalog of paid plans with display name, billing interval, price reference, included monthly credits, availability, and effective dates.
- **FR-002**: The system MUST maintain a catalog of one-time top-up packages with display name, price reference, granted credits, availability, and effective dates.
- **FR-003**: Only authorized workspace owners MUST be able to start subscription checkout, purchase top-ups, or open subscription-management controls.
- **FR-004**: The system MUST grant monthly included credits only after confirmed successful payment for the applicable initial purchase or renewal period.
- **FR-005**: The system MUST grant top-up credits only after confirmed successful payment for the applicable one-time purchase.
- **FR-006**: The system MUST verify payment notifications before using them to change subscription, payment, wallet, or ledger state.
- **FR-007**: The system MUST process each payment notification idempotently so duplicate delivery, retries, and concurrent handling cannot duplicate grants, reversals, or subscription transitions.
- **FR-008**: The system MUST tolerate out-of-order payment notifications by reconciling changes against the related purchase, subscription, payment, and billing-period records.
- **FR-009**: The system MUST preserve a searchable payment-event history including processing outcome, received time, processed time, related workspace when known, and safe failure reason.
- **FR-010**: Each workspace MUST have one credit wallet that reports spendable credits and reserved credits separately.
- **FR-011**: Every wallet balance change MUST create an immutable ledger entry with change type, amount, resulting balance, actor or source, reason, time, and related record identity where applicable.
- **FR-012**: Wallet updates, reservations, releases, charges, grants, reversals, and manual adjustments MUST be atomic so partial balance changes cannot be observed.
- **FR-013**: The system MUST prevent spendable and reserved wallet balances from becoming negative.
- **FR-014**: Monthly included credits MUST expire at the end of their paid billing period unless the workspace has consumed them earlier.
- **FR-015**: Purchased top-up credits MUST remain available while the account remains in good standing and MUST be consumed after credits that expire sooner.
- **FR-016**: The system MUST support reversible credit corrections for payment refunds, disputes, and operator-approved adjustments without deleting historical ledger entries.
- **FR-017**: If a payment reversal exceeds the remaining attributable spendable credits, the system MUST preserve a non-negative wallet, restrict further AI spending as needed, and expose the unresolved amount for platform-operator review.
- **FR-018**: The system MUST maintain configurable model pricing with provider, model, input-token cost, output-token cost, markup, credit conversion rule, availability, and effective dates.
- **FR-019**: Model pricing MUST NOT be hardcoded into job execution behavior.
- **FR-020**: Every settled AI job MUST retain the effective pricing snapshot used for its final credit calculation so later pricing edits do not alter historical charges.
- **FR-021**: The system MUST calculate estimated maximum credits before a job is allowed to run.
- **FR-022**: The system MUST reserve estimated maximum credits atomically before creating a runnable AI job.
- **FR-023**: The system MUST create AI jobs with one of these statuses: `queued`, `running`, `completed`, `failed`, `cancelled`, or `insufficient_credits`.
- **FR-024**: If a workspace lacks sufficient spendable credits, the system MUST record an `insufficient_credits` outcome, MUST NOT reserve credits, and MUST NOT run the AI work.
- **FR-025**: Repeated job-creation requests with the same request identity MUST return the original job and MUST NOT create duplicate reservations.
- **FR-026**: The background execution system MUST ensure that only one active worker can claim a queued job at a time.
- **FR-027**: The background execution system MUST support stale-claim recovery, bounded retries, cancellation where safe, and exactly-once financial finalization.
- **FR-028**: A completed AI job MUST record provider, model, input tokens, output tokens, calculated final credits, reserved credits, released credits, timing, and pricing snapshot.
- **FR-029**: When a job completes, the system MUST settle actual usage, retain the valid final charge, and release unused reserved credits atomically.
- **FR-030**: When a job fails or is cancelled, the system MUST release reserved credits not validly consumed and record the outcome atomically.
- **FR-031**: If measured completion usage exceeds the reservation, the system MUST prevent a negative balance and MUST record any unresolved shortfall for platform-operator review.
- **FR-032**: The system MUST apply configurable rate limits to AI job creation before reservation occurs and MUST support limits by user, workspace, and job type.
- **FR-033**: The system MUST log payment processing, wallet grants, reservations, releases, settlements, reversals, manual adjustments, job claims, completions, failures, cancellations, and rate-limit decisions.
- **FR-034**: Operational logs MUST avoid secrets and minimize sensitive user content while retaining enough metadata for support and reconciliation.
- **FR-035**: Authorized workspace users MUST be able to review a usage dashboard with spendable credits, reserved credits, current-period usage, recent ledger activity, and low-balance guidance.
- **FR-036**: Authorized workspace users MUST be able to review and filter AI job history and inspect a safe job-detail view.
- **FR-037**: Workspace owners MUST be able to review the current plan, renewal state, monthly included credits, available top-ups, payment history, and self-service billing-management route.
- **FR-038**: Platform administrators MUST be able to manage plan availability, top-up availability, future-effective model pricing, manual wallet adjustments, payment investigations, AI job investigations, failures, refunds, and unresolved balances.
- **FR-039**: Manual wallet adjustments MUST require an authenticated platform administrator, a reason, and an immutable ledger entry.
- **FR-040**: The system MUST distinguish workspace roles from platform-administrator access and MUST deny platform operations to ordinary workspace users.
- **FR-041**: The system MUST provide predictable, user-safe recovery guidance for payment, insufficient-credit, rate-limit, job-failure, cancellation, and unresolved-balance outcomes.
- **FR-042**: Automated tests MUST cover wallet grants, immutable ledger records, concurrent reservations, non-negative balances, settlement, unused-credit release, failure refunds, cancellation refunds, payment verification, duplicate events, out-of-order events, top-up reversals, job idempotency, rate limiting, worker claim safety, and administrator authorization.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Billing, wallet, ledger, and AI-job records MUST remain workspace-scoped, and every user-facing read or action MUST verify current workspace membership and permission.
- **STR-002**: Subscription management and top-up purchases MUST be restricted to workspace owners; platform operations MUST require a separate platform-administrator authorization boundary.
- **STR-003**: Browser redirects MUST be treated as navigation only; confirmed and verified payment notifications are the authority for grants, reversals, and paid-state transitions.
- **STR-004**: Financial state transitions MUST be idempotent, atomic, auditable, and safe under retries, concurrent requests, worker crashes, and duplicate notifications.
- **STR-005**: The system MUST reject unsupported or inactive model pricing before a job becomes runnable and MUST preserve historical pricing snapshots for auditability.
- **STR-006**: Logs and operator views MUST redact secrets and minimize prompts, model outputs, payment details, and external-service error content.
- **STR-007**: Manual corrections MUST be append-only financial actions with actor, reason, and related-case context; historical ledger entries MUST NOT be edited or deleted.

### Dashboard Scope

#### Workspace User Dashboard

- **Revenue Overview Extension**: Add a compact AI-credit summary card and low-balance state to the existing revenue workspace dashboard.
- **Usage Overview**: Show spendable credits, reserved credits, current-period consumption, monthly included-credit renewal, top-up balance, and recent ledger activity.
- **AI Jobs**: Show filterable job history, statuses, estimated and final credits, safe error summaries, timestamps, and job details.
- **Billing Settings**: Show current plan, renewal state, included monthly credits, top-up packages, payment history, and owner-only subscription-management actions.

#### Platform Admin Dashboard

- **Operations Overview**: Show payment-processing health, wallet liabilities, unresolved balances, AI-job volume, failed jobs, refunds, and rate-limit activity.
- **Plans and Top-Ups**: Manage availability and future offerings without changing historical purchases.
- **Model Pricing**: Manage provider/model pricing, markup, credit conversion, activation, and future-effective changes.
- **Workspace Wallets**: Search wallet state, inspect ledger history, and submit reasoned manual adjustments.
- **Payments and Events**: Search purchases, subscriptions, payment notifications, processing failures, refunds, disputes, and related ledger entries.
- **AI Job Operations**: Search jobs, inspect retries and claims, review failures and cancellations, and trace settlement records.
- **Audit Log**: Review administrator actions and sensitive operational events.

### Key Entities *(include if feature involves data)*

- **Plan**: A paid recurring offering with billing interval, included monthly credits, availability, and effective dates.
- **Top-Up Package**: A one-time purchasable credit grant available to eligible paid workspaces.
- **Workspace Subscription**: The workspace's current recurring billing relationship, plan, paid period, renewal state, and lifecycle status.
- **Payment Record**: A subscription or top-up payment outcome associated with a workspace and related purchase.
- **Payment Event**: A verified external billing notification and its idempotent processing result.
- **Credit Wallet**: A workspace-scoped balance separating spendable credits from reserved credits and tracking unresolved reversal amounts.
- **Credit Grant**: A traceable batch of monthly or purchased credits with source, remaining amount, and expiration behavior.
- **Credit Ledger Entry**: An immutable record of every grant, expiration, reservation, release, charge, reversal, refund, and manual adjustment.
- **Model Pricing**: A future-effective configuration for provider/model token costs, markup, credit conversion, and availability.
- **AI Job**: An asynchronous workspace request with request identity, type, status, reservation, usage, retries, timing, and safe result metadata.
- **AI Job Claim**: A worker lease used to prevent concurrent execution and recover stale work.
- **AI Usage Record**: The measured token usage and pricing snapshot used to settle a job.
- **Rate Limit Decision**: An auditable allow or reject decision for AI job creation.
- **Platform Administrator**: A separately authorized operator who may manage catalog configuration and perform audited support actions.
- **Operations Audit Entry**: A searchable record of payment, wallet, worker, failure, refund, and administrator activity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A workspace owner can choose a plan, complete checkout, and see the confirmed plan and monthly credit grant within 2 minutes of successful payment confirmation in at least 99% of successful purchase tests.
- **SC-002**: Duplicate, retried, concurrent, and out-of-order payment-notification tests produce zero duplicate credit grants or duplicate reversals.
- **SC-003**: Across all wallet tests, spendable and reserved balances never become negative and every balance change has exactly one matching immutable ledger entry.
- **SC-004**: At least 99.9% of accepted AI-job requests create no more than one reservation and reach one final financial outcome despite retries or worker recovery.
- **SC-005**: For completed jobs with valid usage data, 100% of final credit charges match the effective pricing snapshot and unused reserved credits are released.
- **SC-006**: For failed or cancelled jobs, 100% of releasable reserved credits are returned within 1 minute of finalization.
- **SC-007**: An authorized workspace user can identify available credits, current reservations, and the outcome of a recent AI job in under 60 seconds without support assistance.
- **SC-008**: A workspace owner can find the current plan, next renewal state, top-up options, and self-service billing-management path in under 90 seconds.
- **SC-009**: A platform administrator can locate a payment, its processed event, related ledger entries, related job usage, and any refund or failure trail in under 3 minutes.
- **SC-010**: Rate-limit acceptance tests show that rejected requests create zero runnable jobs and zero credit reservations.
- **SC-011**: Security validation shows zero unauthorized cross-workspace access and zero ordinary workspace-user access to platform administration.
- **SC-012**: Automated coverage includes every critical wallet, ledger, reservation, refund, payment-event, worker-safety, and authorization scenario listed in FR-042 before production release.

## Assumptions

- Billing belongs to a workspace rather than an individual user because the existing product scopes business records and team access to a workspace. The wallet is shared by authorized members, while actor identity is recorded for each user-triggered action.
- The existing workspace `owner` role is the initial billing authority. More granular billing permissions can be added later.
- Platform administrators are internal operators with a separate authorization boundary from workspace roles.
- Monthly included credits expire at the end of their paid billing period and do not roll over. This keeps plan entitlements predictable.
- Purchased top-up credits do not expire while the account remains in good standing. Credits with the earliest expiration are consumed first.
- Top-up purchases are available only to active paid workspaces in the first release.
- Checkout and subscription-management screens use secure hosted billing experiences. The product remains responsible for its own wallet, ledger, job, and usage records.
- Payment confirmation, not browser redirection, is the authority for granting or reversing credits.
- Plan upgrades, downgrades, cancellations, refunds, and disputes are reflected after confirmed billing notifications. Credit effects must remain auditable and non-negative.
- If actual usage unexpectedly exceeds a reservation, the job usage record is preserved and any amount that cannot be settled safely is routed for operator review rather than creating a negative wallet.
- The product starts with token-based AI usage pricing but keeps conversion configurable so additional providers and models can be added later.
- The frontend-owned schema remains the source of truth for billing, wallet, and ledger records shared by product surfaces. The AI backend owns safe background execution behavior and records the runtime metadata needed for jobs.

## Scope Boundaries *(mandatory)*

### Included

- Workspace-scoped paid plans and one-time top-up packages
- Hosted subscription checkout and self-service subscription management
- Verified, idempotent, retry-safe payment processing
- Workspace credit wallet, credit grants, immutable ledger, reservations, settlement, releases, reversals, and manual adjustments
- Configurable effective-dated provider/model pricing and credit conversion
- Asynchronous AI-job creation, status history, worker claims, retries, cancellation, and exactly-once financial finalization
- User usage dashboard, job history, billing settings, and existing-dashboard credit summary
- Platform administration for plans, top-ups, model pricing, wallets, payments, jobs, failures, refunds, rate limits, and audit logs
- AI-job creation rate limiting
- Tests for critical payment, wallet, ledger, job, worker, rate-limit, and authorization behavior

### Deferred

- Usage pricing for non-AI product features
- Organization-level invoicing, purchase orders, tax customization, coupons, referrals, and sales-assisted contracts
- Multiple wallets or separate budgets per workspace member, team, client, campaign, or AI agent
- Automatic credit overage billing, postpaid invoicing, or allowing wallets to spend below zero
- Native mobile billing flows
- Multi-currency wallet accounting
- Customer-facing invoice generation beyond the hosted billing-management experience
- Advanced fraud scoring beyond payment-provider controls, permission checks, event verification, idempotency, and rate limiting
- Full AI-agent implementation for every README roadmap capability; this feature provides the paid-usage foundation and worker-safe job lifecycle
