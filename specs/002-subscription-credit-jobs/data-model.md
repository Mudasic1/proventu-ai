# Data Model: Subscription Credits and AI Jobs

**Created**: 2026-05-31  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Ownership Rules

### Frontend-Owned Tables

The `frontend/` Drizzle migration set owns user-facing billing, wallet, pricing, request, rate-limit, and operator records.

### Backend-Owned Tables

The `backend-ai/` migration set owns execution-runtime records prefixed with `ai_`. Backend migrations must not alter frontend-owned tables.

### Global Configuration Tables

Global tables intentionally omit `workspaceId`:

- `billing_plan`
- `top_up_package`
- `model_pricing`
- `platform_admin`

They are writable only through platform-administrator services.

## Frontend-Owned Entities

### `billing_plan`

Recurring SaaS plan catalog.

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier |
| `code` | Unique stable plan code |
| `name` | Display name |
| `description` | Display description |
| `billingInterval` | Initial release supports `month` |
| `stripePriceId` | Unique Stripe recurring price identity |
| `monthlyIncludedCredits` | Included credit amount |
| `isActive` | Available for new checkout |
| `effectiveFrom` | Earliest sale time |
| `effectiveTo` | Optional end of sale window |
| `createdAt`, `updatedAt` | Audit timestamps |

Validation:

- Credits are positive integers.
- Price identity is unique.
- Historical plans remain stored after deactivation.

### `top_up_package`

One-time credit package catalog.

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier |
| `code` | Unique stable package code |
| `name` | Display name |
| `stripePriceId` | Unique Stripe one-time price identity |
| `grantedCredits` | Purchased credits |
| `isActive` | Available for purchase |
| `effectiveFrom`, `effectiveTo` | Sale window |
| `createdAt`, `updatedAt` | Audit timestamps |

Validation:

- Purchased credits are positive integers.
- Package purchase requires an active paid workspace subscription.

### `workspace_billing_account`

One billing identity per workspace.

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier |
| `workspaceId` | Unique workspace owner |
| `stripeCustomerId` | Unique Stripe customer identity |
| `billingEmail` | Billing contact snapshot |
| `createdAt`, `updatedAt` | Audit timestamps |

### `workspace_subscription`

Current and historical recurring subscription state.

| Field | Purpose |
|---|---|
| `id` | Stable internal identifier |
| `workspaceId` | Workspace owner |
| `billingPlanId` | Related internal plan |
| `stripeSubscriptionId` | Unique Stripe subscription identity |
| `stripeCustomerId` | Related customer identity |
| `status` | Reconciled subscription lifecycle state |
| `currentPeriodStart`, `currentPeriodEnd` | Paid period bounds |
| `cancelAtPeriodEnd` | Scheduled cancellation indicator |
| `endedAt` | Optional terminal time |
| `createdAt`, `updatedAt` | Audit timestamps |

Statuses:

```text
incomplete -> active -> past_due -> unpaid -> cancelled
                      -> paused
active -> cancelled
```

Rules:

- Local state is reconciled from verified Stripe events and canonical Stripe object retrieval.
- Monthly credits are granted from successful paid invoices, not from browser redirects.

### `billing_purchase`

Local checkout attempt and fulfillment record.

| Field | Purpose |
|---|---|
| `id` | Stable purchase identity |
| `workspaceId` | Workspace owner |
| `kind` | `subscription` or `top_up` |
| `billingPlanId` | Optional recurring-plan target |
| `topUpPackageId` | Optional top-up target |
| `requestedByUserId` | Owner starting checkout |
| `idempotencyKey` | Unique local checkout request identity |
| `stripeCheckoutSessionId` | Unique Stripe Checkout identity |
| `stripePaymentIntentId` | Optional one-time payment identity |
| `stripeSubscriptionId` | Optional recurring subscription identity |
| `status` | Checkout and fulfillment state |
| `fulfilledAt` | Optional successful grant time |
| `createdAt`, `updatedAt` | Audit timestamps |

Statuses:

```text
pending -> checkout_created -> paid -> fulfilled
pending -> expired
checkout_created -> failed
fulfilled -> reversed
```

### `payment_record`

Workspace-scoped payment outcome.

| Field | Purpose |
|---|---|
| `id` | Stable payment identity |
| `workspaceId` | Workspace owner |
| `billingPurchaseId` | Optional related checkout attempt |
| `workspaceSubscriptionId` | Optional recurring relationship |
| `kind` | `subscription_invoice`, `top_up`, `refund`, or `dispute` |
| `stripeObjectId` | Unique provider object identity |
| `status` | Payment lifecycle state |
| `amountMinor` | Currency minor units |
| `currency` | Currency code |
| `safeSummary` | Redacted operator summary |
| `occurredAt`, `createdAt`, `updatedAt` | Audit timestamps |

### `stripe_webhook_event`

Durable verified webhook inbox.

| Field | Purpose |
|---|---|
| `id` | Internal identity |
| `stripeEventId` | Unique Stripe event identity |
| `eventType` | Required event type |
| `stripeObjectId` | Primary related object identity |
| `workspaceId` | Nullable until reconciliation |
| `status` | Inbox processing state |
| `attemptCount` | Processing attempts |
| `nextAttemptAt` | Retry time |
| `receivedAt`, `processedAt` | Processing timestamps |
| `safeErrorCode`, `safeErrorMessage` | Redacted failure summary |
| `createdAt`, `updatedAt` | Audit timestamps |

Statuses:

```text
pending -> processing -> processed
pending -> processing -> retry_pending -> processing
processing -> dead_letter
```

Rules:

- Signature verification happens before insertion.
- `stripeEventId` is unique.
- Store safe routing identifiers, not an unrestricted raw payload archive.

### `credit_wallet`

One wallet per workspace.

| Field | Purpose |
|---|---|
| `id` | Stable wallet identity |
| `workspaceId` | Unique workspace owner |
| `spendableCredits` | Credits available for new reservations |
| `reservedCredits` | Credits held for active jobs |
| `unresolvedCredits` | Shortfalls or reversal amounts needing operator review |
| `spendingBlocked` | Prevent new reservations while unresolved |
| `version` | Monotonic mutation version |
| `createdAt`, `updatedAt` | Audit timestamps |

Invariants:

- `spendableCredits >= 0`
- `reservedCredits >= 0`
- `unresolvedCredits >= 0`
- Every balance change is paired with one immutable ledger entry in the same transaction.

### `credit_grant`

Credit provenance batch.

| Field | Purpose |
|---|---|
| `id` | Stable grant identity |
| `workspaceId` | Workspace owner |
| `walletId` | Related wallet |
| `sourceKind` | `monthly`, `top_up`, `manual`, `reversal`, or `migration` |
| `sourceId` | Provider or operator source identity |
| `operationKey` | Unique idempotency identity |
| `grantedCredits` | Original grant size |
| `availableCredits` | Unreserved and unconsumed amount |
| `reservedCredits` | Active held amount |
| `consumedCredits` | Settled amount |
| `reversedCredits` | Reversed amount |
| `expiredCredits` | Expired amount no longer spendable |
| `expiresAt` | Nullable for non-expiring credits |
| `createdAt`, `updatedAt` | Audit timestamps |

Rules:

- Grant totals reconcile: original grant equals currently available, reserved, consumed, reversed, and expired amounts.
- Monthly grants use the Stripe invoice identity as their operation key.
- Top-ups use the Checkout Session or payment identity as their operation key.

### `credit_reservation`

One reservation per runnable AI job request.

| Field | Purpose |
|---|---|
| `id` | Stable reservation identity |
| `workspaceId` | Workspace owner |
| `walletId` | Related wallet |
| `aiJobRequestId` | Unique related request |
| `operationKey` | Unique reservation identity |
| `reservedCredits` | Original reserved amount |
| `settledCredits` | Final settled amount |
| `releasedCredits` | Released amount |
| `shortfallCredits` | Unresolved amount above reservation |
| `status` | Reservation lifecycle |
| `createdAt`, `settledAt`, `releasedAt` | Audit timestamps |

Statuses:

```text
active -> settled
active -> released
```

### `credit_reservation_allocation`

Connects a reservation to one or more grant batches.

| Field | Purpose |
|---|---|
| `id` | Stable allocation identity |
| `workspaceId` | Workspace owner |
| `reservationId` | Related reservation |
| `creditGrantId` | Related grant |
| `reservedCredits` | Amount reserved from the grant |
| `consumedCredits` | Settled amount |
| `releasedCredits` | Returned or expired-on-release amount |
| `createdAt`, `updatedAt` | Audit timestamps |

Rules:

- Allocate from the earliest-expiring active grant first, then by stable ID.
- If a grant expired while credits were reserved, released credits become expired credits rather than spendable credits.

### `credit_ledger_entry`

Immutable wallet journal.

| Field | Purpose |
|---|---|
| `id` | Stable ledger identity |
| `workspaceId` | Workspace owner |
| `walletId` | Related wallet |
| `entryType` | Financial transition kind |
| `operationKey` | Unique idempotency identity |
| `spendableDelta` | Signed spendable change |
| `reservedDelta` | Signed reserved change |
| `unresolvedDelta` | Signed unresolved change |
| `spendableAfter` | Resulting spendable balance |
| `reservedAfter` | Resulting reserved balance |
| `unresolvedAfter` | Resulting unresolved amount |
| `sourceType`, `sourceId` | Related source identity |
| `actorUserId` | Optional initiating user |
| `reason` | Safe audit reason |
| `createdAt` | Immutable timestamp |

Entry types:

```text
grant
expire
reserve
settle
release
reverse
manual_adjustment
shortfall
shortfall_resolution
```

Rules:

- Rows are insert-only.
- Corrections create new entries.
- `operationKey` prevents duplicate financial application.

### `model_pricing`

Effective-dated provider/model configuration.

| Field | Purpose |
|---|---|
| `id` | Stable pricing identity |
| `provider` | Provider key |
| `model` | Provider model key |
| `tokenUnit` | Configured token divisor, normally one million |
| `inputCostMicrousdPerUnit` | Integer input cost |
| `outputCostMicrousdPerUnit` | Integer output cost |
| `markupBasisPoints` | Integer markup |
| `microusdPerCredit` | Integer conversion rate |
| `isActive` | Available for new jobs |
| `effectiveFrom`, `effectiveTo` | Configuration window |
| `createdByUserId` | Platform administrator |
| `createdAt` | Audit timestamp |

Validation:

- No floating-point arithmetic in settlement.
- One active effective row per provider/model at a given instant.
- Historical rows are immutable after use.

Calculation:

```text
rawMicrousd =
  ceil(inputTokens * inputCostMicrousdPerUnit / tokenUnit) +
  ceil(outputTokens * outputCostMicrousdPerUnit / tokenUnit)

markedUpMicrousd =
  ceil(rawMicrousd * (10000 + markupBasisPoints) / 10000)

credits =
  ceil(markedUpMicrousd / microusdPerCredit)
```

### `ai_job_request`

Frontend-owned user-facing AI request and financial-control record.

| Field | Purpose |
|---|---|
| `id` | Stable job identity |
| `workspaceId` | Workspace owner |
| `requestedByUserId` | Requesting actor |
| `jobType` | Controlled task kind |
| `requestKey` | Workspace-scoped idempotency identity |
| `status` | Required user-facing status |
| `provider`, `model` | Requested execution target |
| `pricingSnapshot` | Immutable estimate configuration |
| `estimatedInputTokens`, `estimatedOutputTokens` | Estimate inputs |
| `estimatedCredits` | Reservation amount |
| `finalInputTokens`, `finalOutputTokens` | Measured usage |
| `finalCredits` | Settled charge |
| `releasedCredits` | Released reservation amount |
| `shortfallCredits` | Unresolved additional charge |
| `safeInputSummary`, `safeResultSummary`, `safeErrorCode`, `safeErrorMessage` | Redacted user and operator summaries |
| `dispatchStatus` | Outbox delivery state |
| `createdAt`, `queuedAt`, `startedAt`, `finishedAt`, `updatedAt` | Lifecycle timestamps |

Statuses:

```text
queued -> running -> completed
queued -> cancelled
running -> cancelled
queued -> failed
running -> failed
insufficient_credits
```

Rules:

- Unique `(workspaceId, requestKey)`.
- A request becomes `queued` only after reservation succeeds.
- An insufficient request stores no reservation and is never dispatched.

### `ai_job_dispatch_outbox`

Frontend-owned durable delivery record.

| Field | Purpose |
|---|---|
| `id` | Stable outbox identity |
| `workspaceId` | Workspace owner |
| `aiJobRequestId` | Unique queued request |
| `status` | Delivery lifecycle |
| `attemptCount`, `nextAttemptAt` | Retry control |
| `safeErrorCode`, `safeErrorMessage` | Redacted delivery issue |
| `createdAt`, `dispatchedAt`, `updatedAt` | Audit timestamps |

Statuses:

```text
pending -> dispatching -> dispatched
pending -> dispatching -> retry_pending -> dispatching
dispatching -> dead_letter
```

### `ai_job_rate_limit_bucket`

Frontend-owned bucket for atomic pre-reservation limits.

| Field | Purpose |
|---|---|
| `id` | Stable bucket identity |
| `workspaceId` | Workspace owner |
| `userId` | Nullable for workspace-wide buckets |
| `jobType` | Nullable for all-job buckets |
| `bucketKind` | `user`, `workspace`, or `workspace_job_type` |
| `windowStartedAt` | Current fixed-window start |
| `count` | Requests observed in window |
| `limit` | Configured limit snapshot |
| `updatedAt` | Audit timestamp |

### `ai_job_rate_limit_decision`

Auditable rate-limit decision.

| Field | Purpose |
|---|---|
| `id` | Stable identity |
| `workspaceId` | Workspace owner |
| `userId` | Requesting actor |
| `jobType` | Requested job kind |
| `decision` | `allowed` or `rejected` |
| `retryAfterSeconds` | Optional retry guidance |
| `createdAt` | Audit timestamp |

### `platform_admin`

Separate internal operator authorization.

| Field | Purpose |
|---|---|
| `id` | Stable identity |
| `userId` | Unique authenticated operator |
| `role` | `support`, `billing_admin`, or `super_admin` |
| `isActive` | Access switch |
| `createdAt`, `updatedAt` | Audit timestamps |

Rules:

- Workspace membership never grants platform administration.
- Manual adjustments require `billing_admin` or `super_admin`.

### `operations_audit_entry`

Append-only operator and sensitive-operation audit.

| Field | Purpose |
|---|---|
| `id` | Stable identity |
| `workspaceId` | Nullable for global actions |
| `actorUserId` | Nullable for system actions |
| `actorKind` | `user`, `platform_admin`, `stripe`, `worker`, or `system` |
| `action` | Controlled event key |
| `entityType`, `entityId` | Related record |
| `safeSummary` | Redacted summary |
| `metadata` | Restricted safe metadata |
| `createdAt` | Audit timestamp |

## Backend-Owned Entities

### `ai_job_run`

Backend runtime queue item.

| Field | Purpose |
|---|---|
| `id` | Runtime identity |
| `jobRequestId` | Unique frontend request identity |
| `workspaceId` | Workspace scope copied from contract |
| `jobType` | Controlled task kind |
| `provider`, `model` | Execution target |
| `status` | Runtime state |
| `attemptCount`, `maxAttempts` | Retry control |
| `cancelRequestedAt` | Cooperative cancellation request |
| `availableAt` | Earliest claim time |
| `createdAt`, `startedAt`, `finishedAt`, `updatedAt` | Lifecycle timestamps |

Statuses:

```text
queued -> running -> completed
queued -> running -> retry_pending -> running
queued -> cancelled
running -> cancelled
running -> failed
```

### `ai_job_claim`

Worker lease record.

| Field | Purpose |
|---|---|
| `id` | Stable claim identity |
| `aiJobRunId` | Related runtime row |
| `workerId` | Claiming worker identity |
| `leaseExpiresAt` | Recovery deadline |
| `heartbeatAt` | Latest liveness signal |
| `releasedAt` | Claim completion time |
| `createdAt` | Audit timestamp |

Rules:

- Only one active lease per run.
- Stale leases are recoverable.

### `ai_usage_record`

Measured provider usage and callback state.

| Field | Purpose |
|---|---|
| `id` | Stable usage identity |
| `aiJobRunId` | Unique runtime row |
| `jobRequestId` | Frontend request identity |
| `provider`, `model` | Executed target |
| `inputTokens`, `outputTokens` | Measured usage |
| `providerRequestId` | Optional provider trace identity |
| `finalizationKey` | Unique callback idempotency identity |
| `callbackStatus` | Frontend callback delivery state |
| `callbackAttemptCount`, `nextCallbackAt` | Retry control |
| `safeResultSummary`, `safeErrorCode`, `safeErrorMessage` | Redacted summaries |
| `createdAt`, `updatedAt` | Audit timestamps |

### `ai_worker_event`

Append-only runtime event log.

| Field | Purpose |
|---|---|
| `id` | Stable identity |
| `workspaceId` | Workspace scope |
| `aiJobRunId` | Related run |
| `workerId` | Optional worker identity |
| `eventType` | Runtime event key |
| `safeSummary` | Redacted summary |
| `createdAt` | Audit timestamp |

## Relationship Summary

```text
workspace
|-- workspace_billing_account
|-- workspace_subscription -> billing_plan
|-- billing_purchase -> billing_plan | top_up_package
|-- payment_record
|-- credit_wallet
|   |-- credit_grant
|   |-- credit_reservation
|   |   `-- credit_reservation_allocation -> credit_grant
|   `-- credit_ledger_entry
|-- ai_job_request
|   |-- credit_reservation
|   `-- ai_job_dispatch_outbox
|-- ai_job_rate_limit_bucket
|-- ai_job_rate_limit_decision
`-- operations_audit_entry

ai_job_request.id
`-- ai_job_run.jobRequestId
    |-- ai_job_claim
    |-- ai_usage_record
    `-- ai_worker_event
```

## Critical Transaction Flows

### Monthly Grant

1. Lock verified Stripe inbox event.
2. Resolve paid invoice, workspace subscription, billing plan, and wallet.
3. Insert unique monthly credit grant keyed by invoice.
4. Increment wallet spendable credits.
5. Insert immutable ledger entry.
6. Mark event processed.

### Reserve Job

1. Check and update rate-limit buckets.
2. Resolve active model pricing.
3. Calculate estimated credits.
4. Lock wallet.
5. Reject as `insufficient_credits` if spending is blocked or balance is too low.
6. Lock active grants ordered by expiry and ID.
7. Move grant amounts from available to reserved.
8. Insert job request, reservation, allocations, ledger entry, and dispatch outbox.
9. Commit.

### Settle Completed Job

1. Authenticate internal callback and lock job request.
2. Return stored state if finalization key already applied.
3. Lock wallet, reservation, grants, and allocations.
4. Calculate final credits from measured tokens and stored pricing snapshot.
5. Consume reservation allocations.
6. Release unused allocations or expire them if the grant has already expired.
7. Debit additional spendable credits only if the full extra amount is available.
8. Otherwise record shortfall and block spending.
9. Insert ledger entries and update job final state.
10. Commit.

### Release Failed or Cancelled Job

1. Authenticate internal callback and lock job request.
2. Return stored state if finalization key already applied.
3. Lock wallet, reservation, grants, and allocations.
4. Release valid credits or expire them if their grants have expired.
5. Insert ledger entry and update terminal job state.
6. Commit.
