# Frontend HTTP Contract

**Owner**: `frontend/`  
**Purpose**: User-facing billing, usage, AI-job, and platform-operation boundaries

## Response Envelopes

Success:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Safe user-facing message.",
    "details": {}
  }
}
```

## Common Error Codes

```text
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
OWNER_REQUIRED
PLATFORM_ADMIN_REQUIRED
RATE_LIMITED
INSUFFICIENT_CREDITS
SPENDING_BLOCKED
UNSUPPORTED_MODEL
CHECKOUT_FAILED
WEBHOOK_INVALID
JOB_NOT_CANCELLABLE
INTERNAL_AUTH_FAILED
EXTERNAL_SERVICE_FAILED
```

## User Billing Routes

### `POST /api/billing/checkout/subscription`

Creates a Stripe-hosted subscription Checkout Session.

Authorization:

- Authenticated workspace member
- Workspace role must be `owner`

Request:

```json
{
  "planId": "plan_id",
  "requestKey": "client_generated_uuid"
}
```

Response:

```json
{
  "data": {
    "purchaseId": "purchase_id",
    "checkoutUrl": "https://checkout.stripe.com/..."
  },
  "meta": {}
}
```

Rules:

- Create a local `billing_purchase` before calling Stripe.
- Use the local purchase ID as reconciliation metadata.
- Send a Stripe idempotency key derived from the local purchase request key.
- Redirect success is navigation only and never grants credits.

### `POST /api/billing/checkout/top-up`

Creates a one-time top-up Checkout Session.

Authorization:

- Authenticated workspace `owner`
- Active paid subscription required

Request:

```json
{
  "topUpPackageId": "package_id",
  "requestKey": "client_generated_uuid"
}
```

Response:

```json
{
  "data": {
    "purchaseId": "purchase_id",
    "checkoutUrl": "https://checkout.stripe.com/..."
  },
  "meta": {}
}
```

### `POST /api/billing/portal`

Creates a Stripe-hosted customer portal session.

Authorization:

- Authenticated workspace `owner`

Response:

```json
{
  "data": {
    "portalUrl": "https://billing.stripe.com/..."
  },
  "meta": {}
}
```

## Stripe Webhook Route

### `POST /api/stripe/webhook`

Accepts raw Stripe payload bytes.

Headers:

```text
Stripe-Signature: required
```

Rules:

- Read raw body bytes before JSON transformation.
- Verify the signature before durable insertion.
- Insert one `stripe_webhook_event` row keyed by Stripe event ID.
- Return `2xx` for accepted duplicate delivery.
- Return `400` for malformed or unverifiable payloads.
- Do not perform remote reconciliation or wallet mutation in the request path.

## Workspace Usage Routes

### `GET /api/usage/summary`

Authorization:

- Authenticated workspace member

Response:

```json
{
  "data": {
    "wallet": {
      "spendableCredits": 850,
      "reservedCredits": 150,
      "unresolvedCredits": 0,
      "spendingBlocked": false
    },
    "currentPeriod": {
      "includedCredits": 1000,
      "consumedCredits": 150,
      "renewsAt": "2026-06-30T00:00:00Z"
    }
  },
  "meta": {}
}
```

### `GET /api/usage/ledger?cursor=&limit=`

Authorization:

- Authenticated workspace member

Rules:

- Cursor pagination required.
- Return safe reasons and source summaries.
- Do not return unrestricted provider payloads.

## Workspace AI Job Routes

### `POST /api/ai/jobs`

Creates an AI job request and reservation.

Authorization:

- Authenticated workspace member

Request:

```json
{
  "requestKey": "client_generated_uuid",
  "jobType": "campaign_draft",
  "provider": "configured_provider",
  "model": "configured_model",
  "estimatedInputTokens": 1200,
  "estimatedOutputTokens": 2400,
  "input": {
    "offerId": "offer_id",
    "goal": "Safe bounded input"
  }
}
```

Response:

```json
{
  "data": {
    "jobId": "job_request_id",
    "status": "queued",
    "estimatedCredits": 120,
    "reservedCredits": 120
  },
  "meta": {}
}
```

Insufficient credits response:

```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Add credits or change your plan before starting this AI job.",
    "details": {
      "jobId": "job_request_id"
    }
  }
}
```

Rules:

- Apply rate limits before reservation.
- Resolve model pricing server-side.
- Do not trust client-provided workspace identity or calculated credits.
- Return the existing job for repeated `(workspaceId, requestKey)`.

### `GET /api/ai/jobs?status=&cursor=&limit=`

Authorization:

- Authenticated workspace member

Rules:

- Cursor pagination required.
- Only return current-workspace jobs.

### `GET /api/ai/jobs/{jobId}`

Authorization:

- Authenticated workspace member
- Job must belong to current workspace

### `POST /api/ai/jobs/{jobId}/cancel`

Authorization:

- Authenticated workspace member
- Job must belong to current workspace

Request:

```json
{
  "requestKey": "client_generated_uuid"
}
```

Rules:

- Cancellation is cooperative.
- Final wallet release happens through idempotent financial finalization.

## Internal Scheduled Routes

These routes require a server-only scheduler secret.

### `POST /api/internal/billing/process-events`

Claims pending verified Stripe inbox rows, reconciles canonical Stripe objects, and applies idempotent financial operations.

### `POST /api/internal/credits/expire`

Expires unreserved monthly grant balances and writes ledger entries.

### `POST /api/internal/ai-jobs/dispatch`

Claims pending frontend outbox rows, calls the backend enqueue endpoint, and updates delivery status.

## Backend Callback Route

### `POST /api/internal/ai-jobs/{jobId}/finalize`

Requires internal HMAC authentication. See [backend-internal-api.md](./backend-internal-api.md).

## Platform Admin Routes

All `/api/admin/*` routes require an active `platform_admin` record and role-specific permission.

```text
GET    /api/admin/overview
GET    /api/admin/plans
POST   /api/admin/plans
PATCH  /api/admin/plans/{planId}
GET    /api/admin/top-ups
POST   /api/admin/top-ups
PATCH  /api/admin/top-ups/{topUpPackageId}
GET    /api/admin/model-pricing
POST   /api/admin/model-pricing
GET    /api/admin/workspaces/{workspaceId}/wallet
POST   /api/admin/workspaces/{workspaceId}/wallet/adjustments
GET    /api/admin/payments
GET    /api/admin/stripe-events
GET    /api/admin/ai-jobs
GET    /api/admin/audit
```

Manual adjustment request:

```json
{
  "requestKey": "client_generated_uuid",
  "amountCredits": 500,
  "reason": "Support case CASE-1234 approved credit correction"
}
```

Rules:

- Reason is required.
- Historical ledger entries remain immutable.
- Any negative adjustment that would violate wallet invariants is rejected or routed through unresolved-balance handling.
