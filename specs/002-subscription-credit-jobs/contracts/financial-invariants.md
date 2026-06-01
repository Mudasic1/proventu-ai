# Financial Invariants Contract

**Owner**: `frontend/` credit services  
**Purpose**: Make wallet behavior testable and reviewable

## Required Invariants

1. `credit_wallet.spendableCredits` is never negative.
2. `credit_wallet.reservedCredits` is never negative.
3. `credit_wallet.unresolvedCredits` is never negative.
4. Every wallet mutation inserts exactly one or more immutable ledger entries in the same transaction.
5. Every financial operation has a unique operation key.
6. Replaying an operation key returns the original result without changing balances again.
7. A runnable AI job has exactly one active or terminal reservation.
8. An `insufficient_credits` job has no reservation and no backend dispatch row.
9. Credit grant totals reconcile across available, reserved, consumed, reversed, and expired amounts.
10. Historical ledger entries, pricing snapshots, and settled usage records are append-only.

## Reservation Rules

Reservation:

```text
wallet.spendable -= estimate
wallet.reserved += estimate
grant.available -= allocation
grant.reserved += allocation
```

Settlement when actual usage is within reservation:

```text
wallet.reserved -= reserved
wallet.spendable += released_if_not_expired
grant.reserved -= allocation
grant.consumed += consumed
grant.available += released_if_not_expired
grant.expired += released_if_expired
```

Settlement when actual usage exceeds reservation:

```text
consume reserved amount
if full extra amount is available:
  consume extra amount from spendable grants
else:
  leave wallet non-negative
  record unresolved shortfall
  block new spending
```

Failure or cancellation:

```text
wallet.reserved -= reserved
wallet.spendable += released_if_not_expired
grant.reserved -= allocation
grant.available += released_if_not_expired
grant.expired += released_if_expired
```

## Lock Ordering

Every financial transaction locks records in this order:

1. Wallet
2. Job request or billing purchase
3. Reservation
4. Grants ordered by expiry and ID
5. Reservation allocations

Tests must deliberately issue concurrent reservations and settlements to verify this ordering prevents overspend and duplicate application.

## Expiration Rules

- Expire only unreserved monthly credits.
- Do not invalidate credits already held by an active reservation.
- If a reserved amount is later released after its source grant expired, record expiration rather than returning it to spendable balance.
- Top-up credits have no normal expiration in the initial release.

## Reversal Rules

- Reversals are append-only corrections.
- Reduce remaining attributable spendable credits where possible.
- Do not silently edit or delete prior grant or settlement entries.
- If consumed or reserved credits prevent a complete safe reversal, record unresolved credits and block new spending pending operator review.

## Administrative Adjustment Rules

- Require a platform administrator with billing permission.
- Require a non-empty support reason and request key.
- Insert an immutable ledger entry and operations audit entry.
- Reject a negative adjustment that would violate wallet invariants unless represented as an unresolved-balance correction.
