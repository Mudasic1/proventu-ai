# Stripe Event Contract

**Owner**: `frontend/`  
**Purpose**: Define the minimum Stripe event set and idempotent reconciliation behavior

## Webhook Boundary

`POST /api/stripe/webhook`:

1. Reads the raw request body.
2. Verifies the `Stripe-Signature` header with the configured endpoint secret.
3. Parses only verified payloads.
4. Inserts a durable inbox record keyed by Stripe event ID.
5. Returns quickly.

Wallet changes occur later in the scheduled event processor.

## Required Events

| Stripe Event | Local Effect |
|---|---|
| `checkout.session.completed` | Reconcile completed Checkout. For top-ups, fulfill only if paid. For subscriptions, associate customer and subscription identities but do not grant monthly credits here. |
| `checkout.session.async_payment_succeeded` | Fulfill delayed top-up payment once paid. |
| `checkout.session.async_payment_failed` | Mark delayed Checkout failure and preserve safe audit trail. |
| `invoice.paid` | Reconcile paid subscription invoice and grant monthly included credits exactly once for the paid billing period. |
| `invoice.payment_failed` | Reconcile subscription payment failure and expose billing recovery state. |
| `customer.subscription.created` | Reconcile subscription lifecycle and plan mapping. |
| `customer.subscription.updated` | Reconcile plan, paid period, cancellation scheduling, and lifecycle state. |
| `customer.subscription.deleted` | Mark subscription terminal state. |
| `charge.refunded` | Apply an auditable top-up or payment reversal when relevant. |
| `charge.dispute.created` | Record dispute and apply safe unresolved-balance policy when relevant. |
| `charge.dispute.closed` | Reconcile dispute outcome through append-only corrections. |

## Idempotency

Use multiple barriers:

1. Unique `stripe_webhook_event.stripeEventId`
2. Unique local purchase fulfillment key
3. Unique credit-grant operation key
4. Unique credit-ledger operation key
5. Unique payment-record provider object identity where applicable

Duplicate delivery returns success after recognizing the existing inbox row.

## Out-of-Order Delivery

Do not depend on event arrival order. The processor retrieves canonical Stripe objects when required and reconciles local state from:

- Checkout Session
- Customer
- Subscription
- Invoice
- Charge
- Dispute

Examples:

- `invoice.paid` may arrive before `customer.subscription.updated`.
- `customer.subscription.deleted` may arrive after an earlier retry.
- Duplicate Checkout events may arrive concurrently.

## Grant Rules

### Subscription Credits

- Grant from `invoice.paid`.
- Resolve the internal plan from the paid recurring Stripe price.
- Use invoice ID as the unique monthly-grant source.
- Set `expiresAt` to the paid period end.
- Do not grant from the success-page redirect.
- Do not grant the initial subscription twice from both Checkout completion and invoice payment.

### Top-Up Credits

- Grant only after Checkout payment is confirmed paid.
- Use the Checkout Session or payment identity as the unique source.
- Require an active paid workspace subscription.
- Create reversal ledger entries for refunds and disputes.

## Stripe API Request Idempotency

Send Stripe idempotency keys for server-side `POST` requests that create:

- Checkout Sessions
- Customer portal sessions where retry behavior matters
- Any future billing mutation introduced by this feature

Local request keys remain the source of truth for application-level idempotency.

## Data Minimization

Persist:

- Stripe event ID
- Event type
- Relevant Stripe object ID
- Safe status and error summaries
- Processing timestamps and attempts
- Related workspace when reconciled

Avoid persisting unrestricted webhook payloads unless a later operational requirement explicitly justifies encrypted restricted storage.
