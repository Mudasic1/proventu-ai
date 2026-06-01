# Non-AI Full-Stack Implementation Audit

**Purpose**: Compare the non-AI product requirements in [`README.md`](../README.md) with the current implementation in [`frontend/`](../frontend/) and the delivery plans in [`specs/`](./).  
**Reviewed**: 2026-06-01  
**Scope**: AI generation, AI agents, AI guardrails, AI job execution, and model usage settlement are excluded. Billing, workspace controls, manual marketing workflows, automation execution, integrations, and reporting remain in scope because they are non-AI product requirements.

## Result

- [ ] **All non-AI README requirements are built successfully.**
- [x] **A usable non-AI core revenue workspace is implemented.**
- [x] **Several later modules have database-backed manual foundations only.**
- [ ] **The current repository is release-verified as a complete non-AI system.**

The full non-AI system is **not complete**. Authentication, onboarding, CRM contacts, a basic pipeline, follow-up tasks, workspace-scoped access, basic dashboards, manual marketing records, and several supporting screens exist. External integrations, real scheduling and sending, automation execution, deeper CRM and sales features, billing checkout and webhook handling, and production-level test coverage remain open.

## Status Legend

- `[x] BUILT`: implemented in the current frontend and supported by direct code evidence.
- `[ ] PARTIAL`: a database-backed foundation or limited manual workflow exists, but the README behavior is incomplete.
- `[ ] NOT BUILT`: no implementation evidence was found.
- `[ ] NOT VERIFIED`: implementation may exist, but release-level verification is incomplete.

## Foundation

- [x] **BUILT** Email/password signup, signin, signout, password-reset hooks, sessions, database rate limiting, and protected routes.
- [x] **BUILT** Workspace creation, membership creation, business profile, primary offer, and default pipeline stages.
- [x] **BUILT** Workspace-scoped authorization helpers and role-aware navigation.
- [ ] **PARTIAL** Business setup does not include AI preference boundaries, social-account connections, or email-account connections.
- [ ] **PARTIAL** Team management can add an existing account and change its role, but invitation, removal, and ownership-transfer workflows are absent.

Evidence: [`frontend/src/lib/auth.ts`](../frontend/src/lib/auth.ts), [`frontend/src/server/mutations/workspaces.ts`](../frontend/src/server/mutations/workspaces.ts), [`frontend/src/lib/permissions/rbac.ts`](../frontend/src/lib/permissions/rbac.ts), [`frontend/src/app/(dashboard)/team/page.tsx`](../frontend/src/app/(dashboard)/team/page.tsx).

## CRM And Contacts

- [x] **BUILT** Contact create, view, edit, search, status filter, notes, confirmed soft removal, activity entries, and CSV import summaries.
- [x] **BUILT** Duplicate warning based on normalized email or phone within a workspace.
- [x] **BUILT** Manual company creation, listing, status updates, and basic contact/deal company references.
- [ ] **PARTIAL** Company management lacks company detail pages, editing, removal, and a full company timeline.
- [ ] **PARTIAL** Contact owner is assigned automatically at creation; reassignment is not exposed.
- [ ] **PARTIAL** Contact timeline covers application activity and notes, not email events, social interactions, forms, calls, or meetings.
- [ ] **NOT BUILT** Contact segments.
- [ ] **NOT BUILT** Manual or rule-based lead score.
- [ ] **NOT BUILT** Contact export.
- [ ] **NOT BUILT** Custom fields.

Evidence: [`frontend/src/server/mutations/contacts.ts`](../frontend/src/server/mutations/contacts.ts), [`frontend/src/server/mutations/contact-imports.ts`](../frontend/src/server/mutations/contact-imports.ts), [`frontend/src/server/queries/contacts.ts`](../frontend/src/server/queries/contacts.ts), [`frontend/src/app/(dashboard)/crm/companies/page.tsx`](../frontend/src/app/(dashboard)/crm/companies/page.tsx).

## Sales Pipeline

- [x] **BUILT** Default stages: New Lead, Contacted, Qualified, Meeting Booked, Proposal Sent, Negotiation, Won, and Lost.
- [x] **BUILT** Deal creation, value, expected close date, stage movement, won/lost closure, lost reason, close date, notes, and activity entries.
- [x] **BUILT** Follow-up task creation, priority, due date, contact/deal relationship, completion, and overdue/stale-deal dashboard visibility.
- [ ] **PARTIAL** The pipeline board uses a stage selector; drag-and-drop is not implemented.
- [ ] **PARTIAL** Deal owner is assigned automatically at creation; reassignment is not exposed.
- [ ] **PARTIAL** Deal probability exists in the schema but is not editable in the current deal form.
- [ ] **NOT BUILT** Dedicated meeting-note records.
- [ ] **NOT BUILT** Proposal-status workflow.
- [ ] **NOT BUILT** Non-AI deal-health score.
- [ ] **NOT BUILT** Average deal size, average sales cycle, won/lost ratio, and stage-conversion reporting.

Evidence: [`frontend/src/server/mutations/pipeline.ts`](../frontend/src/server/mutations/pipeline.ts), [`frontend/src/components/pipeline/pipeline-board.tsx`](../frontend/src/components/pipeline/pipeline-board.tsx), [`frontend/src/components/pipeline/deal-form.tsx`](../frontend/src/components/pipeline/deal-form.tsx), [`frontend/src/server/queries/dashboard.ts`](../frontend/src/server/queries/dashboard.ts).

## Social Content

- [x] **BUILT** Manual campaign records and manual social-post drafts.
- [x] **BUILT** Internal planned schedule dates and a basic content-calendar timeline.
- [ ] **PARTIAL** Scheduled and published statuses are internal planning states only; no external publishing is connected.
- [ ] **NOT BUILT** Social-account connection.
- [ ] **NOT BUILT** Media library.
- [ ] **NOT BUILT** Approval workflow for posts.
- [ ] **NOT BUILT** Campaign folders, post categories, bulk scheduling, reposting, and repurposing workflows.
- [ ] **NOT BUILT** Social performance tracking: reach, engagement, clicks, follower growth, best platform, and best posting time.

Evidence: [`frontend/src/app/(dashboard)/marketing/posts/page.tsx`](../frontend/src/app/(dashboard)/marketing/posts/page.tsx), [`frontend/src/app/(dashboard)/marketing/calendar/page.tsx`](../frontend/src/app/(dashboard)/marketing/calendar/page.tsx), [`frontend/src/server/mutations/workspace-modules.ts`](../frontend/src/server/mutations/workspace-modules.ts).

## Email Marketing

- [x] **BUILT** Manual email-campaign draft records.
- [x] **BUILT** Manual email-sequence container records.
- [ ] **PARTIAL** Sequence-step tables exist, but sequence-step editing and execution are not implemented.
- [ ] **PARTIAL** Scheduled and sent statuses are internal/manual records only; no delivery provider is connected.
- [ ] **NOT BUILT** Email-account connection.
- [ ] **NOT BUILT** Newsletter or outreach sending.
- [ ] **NOT BUILT** Templates, recipient segments, personalization fields, and A/B subject testing.
- [ ] **NOT BUILT** Open, click, reply, bounce, unsubscribe, and conversion tracking.
- [ ] **NOT BUILT** Deliverability guidance and follow-up automation.
- [ ] **NOT BUILT** Email performance dashboard.

Evidence: [`frontend/src/app/(dashboard)/marketing/email-campaigns/page.tsx`](../frontend/src/app/(dashboard)/marketing/email-campaigns/page.tsx), [`frontend/src/app/(dashboard)/marketing/email-sequences/page.tsx`](../frontend/src/app/(dashboard)/marketing/email-sequences/page.tsx), [`frontend/src/lib/db/schema.ts`](../frontend/src/lib/db/schema.ts).

## Inbox And Automations

- [ ] **PARTIAL** Inbox conversation and message records exist for internal notes only.
- [ ] **NOT BUILT** External email replies, social comments, social DMs, lead-form messages, and contact-message ingestion.
- [ ] **PARTIAL** Automation rule, trigger, condition, and action tables exist; the UI creates one trigger and one action.
- [ ] **NOT BUILT** Automation execution engine, condition editor, delay/wait steps, notifications, retries, and execution history.

Evidence: [`frontend/src/app/(dashboard)/inbox/page.tsx`](../frontend/src/app/(dashboard)/inbox/page.tsx), [`frontend/src/app/(dashboard)/automations/page.tsx`](../frontend/src/app/(dashboard)/automations/page.tsx), [`frontend/src/lib/db/schema.ts`](../frontend/src/lib/db/schema.ts).

## Analytics

- [x] **BUILT** Basic workspace metrics from real records: contacts, companies, open deals, pipeline value, won revenue for the last seven days, active campaigns, scheduled posts, and pending tasks.
- [x] **BUILT** Revenue dashboard priorities: follow-ups, stale deals, qualified leads, campaign snapshot, and recent activity.
- [ ] **PARTIAL** Dashboard links exist for some underlying records, but the broader README analytics suite is not implemented.
- [ ] **NOT BUILT** Social analytics beyond scheduled-post counts.
- [ ] **NOT BUILT** Email analytics beyond draft counts.
- [ ] **NOT BUILT** Sales conversion, close-time, lost-reason, follow-up-compliance, and rep-performance reports.

Evidence: [`frontend/src/server/queries/dashboard.ts`](../frontend/src/server/queries/dashboard.ts), [`frontend/src/server/queries/workspace-modules.ts`](../frontend/src/server/queries/workspace-modules.ts), [`frontend/src/app/(dashboard)/analytics/page.tsx`](../frontend/src/app/(dashboard)/analytics/page.tsx).

## Roles, Settings, Billing, And Platform Admin

- [x] **BUILT** Workspace role matrix for owner, admin, sales manager, sales rep, marketer, client, and viewer.
- [x] **BUILT** Workspace settings for timezone, currency, brand voice, email from-name, and content-review default.
- [x] **BUILT** Separate `isSuperAdmin` boundary and a read-only platform overview.
- [ ] **PARTIAL** Billing-plan and workspace-subscription records exist with a read-only workspace summary.
- [ ] **NOT BUILT** Stripe checkout, billing portal, verified webhook handling, payment history, renewals, top-ups, refunds, disputes, and billing reconciliation.
- [ ] **NOT BUILT** Workspace credit wallet, ledger, grants, reservations, and non-negative balance controls planned by [`specs/002-subscription-credit-jobs`](./002-subscription-credit-jobs/).
- [ ] **PARTIAL** Super-admin dashboard shows aggregate counts only; operational management screens and audited support actions are absent.

Evidence: [`frontend/src/lib/permissions/roles.ts`](../frontend/src/lib/permissions/roles.ts), [`frontend/src/app/(dashboard)/settings/page.tsx`](../frontend/src/app/(dashboard)/settings/page.tsx), [`frontend/src/app/(dashboard)/settings/billing/page.tsx`](../frontend/src/app/(dashboard)/settings/billing/page.tsx), [`frontend/src/app/(super-admin)/admin/page.tsx`](../frontend/src/app/(super-admin)/admin/page.tsx).

## Verification

- [x] **PASSED** `npm.cmd test`: 4 unit-test files, 12 tests.
- [x] **PASSED** `npm.cmd run lint`.
- [x] **PASSED** `npm.cmd run typecheck`.
- [ ] **NOT VERIFIED** `npm.cmd run build`: sandboxed build could not fetch Google Fonts (`Manrope` and `Syne`). This is an environment/network limitation, not a successful production-build result.
- [ ] **NOT BUILT** Frontend integration-test suite.
- [ ] **NOT BUILT** Browser end-to-end suite.
- [ ] **NOT VERIFIED** Applied database migrations against a test Neon database.
- [ ] **NOT VERIFIED** Cross-workspace regression suite for all modules.

## Spec Delivery Status

- [ ] **PARTIAL** [`specs/001-phase1-revenue-workspace/tasks.md`](./001-phase1-revenue-workspace/tasks.md): 44 of 92 tasks are marked complete. The implemented non-AI core is ahead of some original task-list entries, but integration tests, browser tests, AI campaign work, and release gates remain open.
- [ ] **PLANNED ONLY** [`specs/002-subscription-credit-jobs/tasks.md`](./002-subscription-credit-jobs/tasks.md): 0 of 102 tasks are marked complete. The current lightweight subscription tables are not the production billing, wallet, or background-job system described by this spec.

## Release Decision

- [ ] **Do not mark the complete non-AI README system as finished.**
- [x] **Treat the current implementation as a working core revenue-workspace foundation.**
- [ ] **Before a non-AI release claim, define the intended release boundary and complete its integration, migration, and browser verification gates.**
