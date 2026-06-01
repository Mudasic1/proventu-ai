# Quickstart: Subscription Credits and AI Jobs

**Created**: 2026-05-31  
**Purpose**: Validate the planned implementation locally after `/speckit-tasks` and implementation

## Prerequisites

- Node.js 20+
- Python 3.13+
- Neon Postgres development database
- Stripe test-mode account
- Stripe CLI
- Separate terminal for the Next.js app
- Separate terminal for the AI API and worker

## Environment Additions

Frontend server-only variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_SUCCESS_URL
STRIPE_CANCEL_URL
STRIPE_PORTAL_RETURN_URL
INTERNAL_SERVICE_HMAC_SECRET
INTERNAL_CRON_SECRET
DATABASE_URI
DATABASE_DIRECT_URI
```

Backend server-only variables:

```text
DATABASE_URI
FRONTEND_INTERNAL_BASE_URL
INTERNAL_SERVICE_HMAC_SECRET
AI_WORKER_ID
AI_WORKER_LEASE_SECONDS
```

Do not commit secrets. Keep provider/model costs in `model_pricing`, not environment variables or source code.

## Planned Local Startup

Frontend:

```powershell
cd frontend
npm install
npm run db:migrate
npm run dev
```

Stripe webhook forwarding:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Backend API and worker commands will be finalized in `tasks.md` after the FastAPI scaffold is added.

## Verification Sequence

### 1. Seed Configuration

- Create one active monthly plan mapped to a Stripe test recurring price.
- Create one active top-up package mapped to a Stripe test one-time price.
- Create one active `model_pricing` row.
- Create one platform administrator.

### 2. Subscribe

1. Sign in as a workspace owner.
2. Open billing settings.
3. Start subscription Checkout.
4. Complete Stripe test checkout.
5. Confirm the webhook inbox receives the event.
6. Trigger or wait for scheduled billing reconciliation.
7. Verify the subscription is active.
8. Verify exactly one monthly grant and matching ledger entry exist.

### 3. Buy a Top-Up

1. Start a top-up Checkout as the same owner.
2. Complete payment.
3. Verify exactly one top-up grant.
4. Replay the same Stripe event.
5. Verify the wallet balance does not change again.

### 4. Queue and Settle a Job

1. Create an AI job request with a unique request key.
2. Verify credits move from spendable to reserved.
3. Verify one frontend dispatch row exists.
4. Trigger frontend dispatch.
5. Verify one backend runtime row exists.
6. Run the worker.
7. Verify measured token usage is returned through finalization.
8. Verify actual credits are settled and unused reserved credits return.
9. Verify the workspace usage dashboard shows the ledger trail.

### 5. Verify Failure Refund

1. Run a provider-failure fixture.
2. Verify the job becomes failed.
3. Verify releasable reserved credits return.
4. Verify retry and failure events remain auditable.

### 6. Verify Concurrency Safety

1. Seed a wallet near the reservation boundary.
2. Submit concurrent job requests.
3. Verify total reservations never exceed spendable credits.
4. Verify rejected work creates no runnable backend row.

### 7. Verify Authorization

1. Sign in as a non-owner workspace member.
2. Verify usage visibility is available.
3. Verify checkout and portal actions are denied.
4. Verify platform administration is denied.
5. Sign in as a platform administrator.
6. Verify manual adjustment requires a reason and writes ledger and audit entries.

## Planned Quality Commands

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
```

Backend:

```powershell
cd backend-ai
pytest
ruff check .
```

## Operational Checks

- Inspect oldest pending Stripe inbox age.
- Inspect oldest pending AI dispatch age.
- Inspect stale worker claims.
- Inspect finalization callback retries.
- Inspect unresolved balances and spending-blocked wallets.
- Confirm logs contain safe identifiers and summaries only.
