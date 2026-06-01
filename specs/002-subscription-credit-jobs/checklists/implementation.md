# Implementation Checklist: Subscription Credits and AI Jobs

**Purpose**: Track planning, implementation, and release readiness for the subscription, credit wallet, and background AI job system  
**Created**: 2026-05-31  
**Feature**: [spec.md](../spec.md)

## Planning Gates

- [x] Create `plan.md` with architecture boundaries, transaction strategy, worker model, and rollout sequence
- [x] Create `data-model.md` with wallet, ledger, payment, subscription, pricing, AI job, claim, usage, and audit entities
- [x] Create contracts for checkout, billing portal, webhook processing, wallet queries, AI job creation, worker claims, and admin operations
- [x] Create `tasks.md` with dependency-ordered implementation tasks and explicit test-first tasks
- [ ] Review the implementation plan before changing application code

## Wallet Safety

- [ ] Add workspace-scoped wallet records with separate spendable and reserved balances
- [ ] Add immutable ledger entries for every balance transition
- [ ] Add credit grants with source provenance and expiration behavior
- [ ] Add atomic reservation, settlement, release, reversal, and manual-adjustment operations
- [ ] Enforce non-negative wallet invariants under concurrent requests
- [ ] Add tests for grants, ledger entries, concurrent reservations, settlement, refunds, reversals, and negative-balance prevention

## Billing

- [ ] Add plan and top-up catalogs with effective dates and availability
- [ ] Add owner-only subscription and top-up checkout initiation
- [ ] Add owner-only billing portal initiation
- [ ] Add raw-body webhook verification
- [ ] Add idempotent and out-of-order-safe webhook processing
- [ ] Add subscription renewal, cancellation, refund, and dispute reconciliation
- [ ] Add tests for signature rejection, duplicate events, concurrent events, out-of-order delivery, grants, reversals, and eligibility

## Pricing

- [ ] Add configurable provider and model pricing with input cost, output cost, markup, credit conversion, availability, and effective dates
- [ ] Add pricing snapshots for settled jobs
- [ ] Reject unsupported or inactive pricing before queueing
- [ ] Add pricing estimation and settlement tests

## AI Jobs and Workers

- [ ] Add idempotent AI job creation with required statuses
- [ ] Reserve estimated credits before a job becomes runnable
- [ ] Add worker claims, leases, stale-claim recovery, bounded retries, and safe cancellation
- [ ] Add exactly-once financial finalization
- [ ] Record measured token usage and release unused reserved credits
- [ ] Record unresolved shortfalls without allowing negative balances
- [ ] Add tests for duplicate requests, claim contention, stale recovery, completion, failure, cancellation, and shortfalls

## Dashboards

- [ ] Extend the workspace revenue dashboard with credit summaries and low-balance guidance
- [ ] Add workspace usage dashboard and ledger history
- [ ] Add AI job list and safe detail views
- [ ] Add owner-only billing settings
- [ ] Add platform-admin operations overview
- [ ] Add platform-admin plan, top-up, pricing, wallet, payment-event, job, refund, and audit views
- [ ] Add authorization tests for workspace roles and platform administrators

## Hardening

- [ ] Add user, workspace, and job-type rate limiting before reservation
- [ ] Add structured logs for payments, wallet transitions, jobs, claims, failures, refunds, and rate-limit decisions
- [ ] Redact secrets and minimize sensitive user content in logs and operator views
- [ ] Add reconciliation guidance and operational runbooks
- [ ] Run lint, typecheck, unit tests, integration tests, and critical end-to-end checks

## Notes

- Application implementation is blocked until `plan.md` and `tasks.md` exist.
- Preserve the existing unrelated modification in `frontend/src/server/mutations/workspaces.ts`.
