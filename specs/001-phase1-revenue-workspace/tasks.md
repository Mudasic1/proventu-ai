# Tasks: Phase 1 Core Revenue Workspace

**Input**: Design documents from `/specs/001-phase1-revenue-workspace/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/http-api.md](./contracts/http-api.md)

**Tests**: Included because `development-flow.md` requires automated coverage for authentication, CRM, pipeline, AI drafts, API contracts, database migrations, and critical end-to-end flows.

**Organization**: Tasks are grouped by user story so each story can be implemented, demonstrated, and validated as an incremental vertical slice.

**Current implementation scope**: The non-AI revenue workspace is being implemented first. AI agents, AI campaign generation, generated drafts, approvals, sending, publishing, scheduling, and autonomous execution remain intentionally open.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files without depending on incomplete tasks
- **[Story]**: Maps a task to its user story from [spec.md](./spec.md)
- Every task names its implementation path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish project dependencies, configuration entry points, and test harnesses.

- [x] T001 Add frontend database, validation, authentication, testing, and CSV parsing dependencies in `frontend/package.json`
- [x] T002 [P] Add frontend database toolkit configuration in `frontend/drizzle.config.ts`
- [ ] T003 [P] Add AI backend API, validation, database, settings, testing, and AI dependencies in `backend-ai/pyproject.toml`
- [ ] T004 [P] Create AI backend package structure in `backend-ai/app/__init__.py`, `backend-ai/app/api/__init__.py`, `backend-ai/app/core/__init__.py`, `backend-ai/app/db/__init__.py`, `backend-ai/app/schemas/__init__.py`, `backend-ai/app/services/__init__.py`, `backend-ai/app/agents/__init__.py`, and `backend-ai/app/guardrails/__init__.py`
- [x] T005 [P] Configure frontend unit and integration test runner in `frontend/vitest.config.ts` and `frontend/tests/setup.ts`
- [ ] T006 [P] Configure frontend browser test runner in `frontend/playwright.config.ts`
- [ ] T007 [P] Add documented environment variable templates in `frontend/.env.example` and `backend-ai/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared security, database, error, and transport foundation required by every user story.

**Checkpoint**: No user story work begins until workspace authorization and shared error contracts are available.

- [x] T008 Define frontend-owned Phase 1 business tables and relationships in `frontend/src/lib/db/schema.ts`
- [x] T009 Generate the initial frontend-owned Phase 1 database migration in `frontend/drizzle/0001_majestic_lucky_pierre.sql`
- [x] T010 [P] Add frontend server-only environment validation in `frontend/src/lib/env/server.ts`
- [x] T011 [P] Add frontend database connection module in `frontend/src/lib/db/index.ts`
- [x] T012 [P] Add shared frontend application error types and serialization in `frontend/src/lib/errors/app-error.ts`
- [x] T013 Add authenticated session resolution in `frontend/src/lib/auth/session.ts`
- [x] T014 Add workspace membership resolution and workspace-scoped authorization helpers in `frontend/src/lib/permissions/workspace.ts`
- [x] T015 Add protected dashboard route guard in `frontend/src/app/(dashboard)/layout.tsx`
- [ ] T016 [P] Add AI backend server-only settings validation in `backend-ai/app/core/config.py`
- [ ] T017 [P] Add AI backend database session management in `backend-ai/app/db/session.py`
- [ ] T018 [P] Add AI backend success and error envelope schemas in `backend-ai/app/schemas/envelopes.py`
- [ ] T019 Add AI backend auth and workspace dependency resolution in `backend-ai/app/api/deps.py`
- [ ] T020 Add AI backend application bootstrap and health route in `backend-ai/app/main.py` and replace the placeholder runner in `backend-ai/main.py`
- [ ] T021 [P] Add typed frontend AI backend client with stable error mapping in `frontend/src/lib/api-client/backend-ai.ts`
- [ ] T022 [P] Add foundational migration schema checks in `frontend/tests/integration/db-schema.test.ts`
- [ ] T023 [P] Add workspace authorization isolation tests in `frontend/tests/integration/workspace-permissions.test.ts`
- [ ] T024 [P] Add AI backend health and error envelope tests in `backend-ai/tests/api/test_health.py`

---

## Phase 3: User Story 1 - Set Up a Revenue Workspace (Priority: P1)

**Goal**: Allow a signed-in first-time user to create a business workspace, save the context required by later features, and reach a protected dashboard.

**Independent Test**: A new signed-in user completes onboarding and can revisit the protected dashboard without repeating setup.

### Tests for User Story 1

- [x] T025 [P] [US1] Add onboarding validation unit tests in `frontend/tests/unit/onboarding-validation.test.ts`
- [ ] T026 [P] [US1] Add workspace onboarding integration tests for profile creation, membership creation, and default pipeline creation in `frontend/tests/integration/onboarding.test.ts`
- [ ] T027 [P] [US1] Add protected-route integration tests for signed-out, incomplete-onboarding, and workspace-ready states in `frontend/tests/integration/dashboard-guard.test.ts`

### Implementation for User Story 1

- [x] T028 [P] [US1] Define business profile and offer input validation in `frontend/src/lib/validations/onboarding.ts`
- [x] T029 [US1] Implement workspace, membership, business profile, offer, and default pipeline creation transaction in `frontend/src/server/mutations/workspaces.ts`
- [x] T030 [US1] Add workspace onboarding server action with predictable field errors in `frontend/src/server/actions/onboarding.ts`
- [x] T031 [P] [US1] Build reusable onboarding form sections in `frontend/src/components/onboarding/business-profile-form.tsx`
- [x] T032 [US1] Add the onboarding route and completion redirect in `frontend/src/app/onboarding/page.tsx`
- [x] T033 [P] [US1] Add workspace profile editing page in `frontend/src/app/(dashboard)/settings/workspace/page.tsx`

**Checkpoint**: A signed-in first-time user has a protected, workspace-scoped product shell.

---

## Phase 4: User Story 2 - Manage CRM Contacts (Priority: P1)

**Goal**: Allow users to maintain workspace-scoped contacts with activity history, duplicate warnings, search, filtering, and structured import summaries.

**Independent Test**: A workspace user creates, edits, searches, filters, imports, and deliberately removes contacts while another workspace cannot access those records.

### Tests for User Story 2

- [x] T034 [P] [US2] Add contact validation and duplicate normalization unit tests in `frontend/tests/unit/contact-validation.test.ts`
- [ ] T035 [P] [US2] Add workspace-scoped contact mutation and activity integration tests in `frontend/tests/integration/contacts.test.ts`
- [ ] T036 [P] [US2] Add contact import accepted, rejected, and duplicate row integration tests in `frontend/tests/integration/contact-import.test.ts`

### Implementation for User Story 2

- [x] T037 [P] [US2] Define contact and contact-import input validation in `frontend/src/lib/validations/contacts.ts`
- [x] T038 [P] [US2] Add workspace-scoped contact list, search, filter, detail, and duplicate lookup queries in `frontend/src/server/queries/contacts.ts`
- [x] T039 [US2] Implement contact create, update, note, and confirmed removal mutations with activity entries in `frontend/src/server/mutations/contacts.ts`
- [x] T040 [US2] Implement structured contact import parsing and row classification in `frontend/src/server/mutations/contact-imports.ts`
- [x] T041 [US2] Add contact and import server actions with workspace authorization in `frontend/src/server/actions/contacts.ts`
- [x] T042 [P] [US2] Build contact list, filters, and empty state in `frontend/src/components/crm/contact-list.tsx`
- [x] T043 [P] [US2] Build contact create and edit form with duplicate warning state in `frontend/src/components/crm/contact-form.tsx`
- [x] T044 [P] [US2] Build contact timeline and note composer in `frontend/src/components/crm/contact-timeline.tsx`
- [x] T045 [P] [US2] Build structured contact import form and result summary in `frontend/src/components/crm/contact-import-form.tsx`
- [x] T046 [US2] Add CRM contact list, new-contact, import, and contact-detail routes in `frontend/src/app/(dashboard)/crm/contacts/page.tsx`, `frontend/src/app/(dashboard)/crm/contacts/new/page.tsx`, `frontend/src/app/(dashboard)/crm/contacts/import/page.tsx`, and `frontend/src/app/(dashboard)/crm/contacts/[contactId]/page.tsx`

**Checkpoint**: Contacts are usable as the trusted workspace-scoped revenue data source.

---

## Phase 5: User Story 3 - Track Deals and Follow-Ups (Priority: P1)

**Goal**: Allow users to manage opportunities through a simple pipeline and keep follow-up work visible.

**Independent Test**: A user creates a deal for a contact, moves it between stages, closes it with the required outcome details, and completes a related follow-up task.

### Tests for User Story 3

- [x] T047 [P] [US3] Add deal and task validation unit tests in `frontend/tests/unit/pipeline-validation.test.ts`
- [ ] T048 [P] [US3] Add deal movement, won/lost outcome, activity history, and workspace isolation integration tests in `frontend/tests/integration/deals.test.ts`
- [ ] T049 [P] [US3] Add follow-up task create, overdue, update, and completion integration tests in `frontend/tests/integration/tasks.test.ts`

### Implementation for User Story 3

- [x] T050 [P] [US3] Define deal movement, deal closure, and follow-up task input validation in `frontend/src/lib/validations/pipeline.ts`
- [x] T051 [P] [US3] Add workspace-scoped pipeline, deal-detail, stale-deal, and task-priority queries in `frontend/src/server/queries/pipeline.ts`
- [x] T052 [US3] Implement deal creation, stage movement, won closure, lost closure, and activity mutations in `frontend/src/server/mutations/pipeline.ts`
- [x] T053 [US3] Implement follow-up task creation and completion mutations in `frontend/src/server/mutations/pipeline.ts`
- [x] T054 [US3] Add deal and task server actions with workspace authorization in `frontend/src/server/actions/pipeline.ts`
- [x] T055 [P] [US3] Build pipeline board and stage columns in `frontend/src/components/pipeline/pipeline-board.tsx`
- [x] T056 [P] [US3] Build deal creation and closure forms in `frontend/src/components/pipeline/deal-form.tsx` and `frontend/src/app/(dashboard)/sales/deals/[dealId]/page.tsx`
- [x] T057 [P] [US3] Build follow-up task list, creation, and completion controls in `frontend/src/components/pipeline/task-list.tsx` and `frontend/src/components/pipeline/task-form.tsx`
- [x] T058 [US3] Add pipeline board, deal-detail, and task routes in `frontend/src/app/(dashboard)/sales/pipeline/page.tsx`, `frontend/src/app/(dashboard)/sales/deals/[dealId]/page.tsx`, and `frontend/src/app/(dashboard)/sales/tasks/page.tsx`

**Checkpoint**: Users can track revenue movement and follow-up work independently of AI campaign generation.

---

## Phase 6: User Story 4 - Generate and Approve Campaign Drafts (Priority: P1)

**Goal**: Generate a supervised campaign plan with editable social and email drafts while enforcing review and risk visibility.

**Independent Test**: A user requests a plan, receives structured drafts, edits and reviews them, retries safely after failure, and cannot accidentally send or publish content.

### Tests for User Story 4

- [ ] T059 [P] [US4] Add AI campaign request, response, and structured-output schema tests in `backend-ai/tests/unit/test_campaign_schemas.py`
- [ ] T060 [P] [US4] Add marketing claim and risky-language guardrail unit tests in `backend-ai/tests/unit/test_campaign_guardrails.py`
- [ ] T061 [P] [US4] Add campaign generation success, validation, unauthorized, failure, and idempotency API tests in `backend-ai/tests/api/test_campaign_plans.py`
- [ ] T062 [P] [US4] Add frontend campaign create, generation result persistence, draft editing, and approval integration tests in `frontend/tests/integration/campaigns.test.ts`

### Implementation for User Story 4

- [ ] T063 [P] [US4] Define AI backend campaign request, generated plan, draft, risk flag, and task suggestion schemas in `backend-ai/app/schemas/campaigns.py`
- [ ] T064 [P] [US4] Add backend-owned AI run and guardrail result models in `backend-ai/app/db/models/ai_runs.py`
- [ ] T065 [US4] Add AI run repository with workspace scoping and idempotency-key lookup in `backend-ai/app/db/repositories/ai_runs.py`
- [ ] T066 [P] [US4] Implement marketing claim and risky-language checks in `backend-ai/app/guardrails/campaign_content.py`
- [ ] T067 [US4] Implement structured supervised campaign planner orchestration in `backend-ai/app/services/campaign_planner.py`
- [ ] T068 [US4] Add idempotent authenticated campaign planning route in `backend-ai/app/api/routes/campaign_plans.py` and register it in `backend-ai/app/main.py`
- [ ] T069 [P] [US4] Define frontend campaign, draft edit, and approval input validation in `frontend/src/lib/validations/campaigns.ts`
- [ ] T070 [P] [US4] Add frontend AI campaign plan contract types in `frontend/src/lib/api-client/campaign-plans.ts`
- [ ] T071 [US4] Implement campaign creation, generation result persistence, draft edits, and approval decisions in `frontend/src/server/mutations/campaigns.ts`
- [ ] T072 [US4] Add campaign generation, draft editing, approval, and rejection server actions in `frontend/src/server/actions/campaigns.ts`
- [ ] T073 [P] [US4] Build campaign request form and generation status states in `frontend/src/components/campaigns/campaign-planner-form.tsx`
- [ ] T074 [P] [US4] Build editable social and email draft review cards with risk flags in `frontend/src/components/campaigns/draft-review-card.tsx`
- [ ] T075 [P] [US4] Build pending approval queue in `frontend/src/components/campaigns/approval-queue.tsx`
- [ ] T076 [US4] Add campaign list, new-campaign, campaign-detail, and approval queue routes in `frontend/src/app/(dashboard)/marketing/campaigns/page.tsx`, `frontend/src/app/(dashboard)/marketing/campaigns/new/page.tsx`, `frontend/src/app/(dashboard)/marketing/campaigns/[campaignId]/page.tsx`, and `frontend/src/app/(dashboard)/marketing/approvals/page.tsx`

**Checkpoint**: The first differentiated AI workflow is useful, auditable, idempotent, and human controlled.

---

## Phase 7: User Story 5 - Review the Daily Revenue Snapshot (Priority: P2)

**Goal**: Give users an accurate workspace summary and direct paths to priority records.

**Independent Test**: Seeded workspace records produce correct dashboard summaries, priority lists, filtered links, and an actionable empty state.

### Tests for User Story 5

- [ ] T077 [P] [US5] Add dashboard summary calculation unit tests in `frontend/tests/unit/dashboard-summary.test.ts`
- [ ] T078 [P] [US5] Add dashboard workspace isolation, aggregate accuracy, priorities, and empty-state integration tests in `frontend/tests/integration/dashboard.test.ts`

### Implementation for User Story 5

- [x] T079 [US5] Add workspace-scoped revenue snapshot, non-AI priority, and recent activity queries in `frontend/src/server/queries/dashboard.ts`
- [ ] T080 [P] [US5] Build dashboard metric cards linked to filtered record views in `frontend/src/components/dashboard/metric-cards.tsx`
- [ ] T081 [P] [US5] Build dashboard priorities and recent activity sections in `frontend/src/components/dashboard/revenue-priorities.tsx`
- [ ] T082 [P] [US5] Build dashboard empty state with next setup actions in `frontend/src/components/dashboard/dashboard-empty-state.tsx`
- [x] T083 [US5] Assemble the protected revenue dashboard in `frontend/src/app/(dashboard)/dashboard/page.tsx`

**Checkpoint**: Users can start the day from real revenue summaries and navigate directly to the records that need attention.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete Phase 1 workflow and tighten trust, usability, and operational documentation.

- [ ] T084 [P] Add critical browser flow covering onboarding, contact creation, deal creation, campaign generation, draft approval, and dashboard review in `frontend/tests/e2e/phase1-revenue-workspace.spec.ts`
- [x] T085 [P] Add responsive navigation and dashboard shell for Phase 1 routes in `frontend/src/components/dashboard/dashboard-shell.tsx`
- [ ] T086 Add audit-history coverage for contact removal, deal movement, generation, and approvals in `frontend/tests/integration/activity-history.test.ts`
- [ ] T087 Add cross-workspace access regression coverage for contacts, deals, tasks, campaigns, approvals, and dashboard summaries in `frontend/tests/integration/workspace-isolation.test.ts`
- [x] T088 [P] Document frontend setup, environment variables, migrations, and test commands in `frontend/README.md`
- [ ] T089 [P] Document AI backend setup, environment variables, API startup, and test commands in `backend-ai/README.md`
- [ ] T090 Run frontend type checks, linting, unit tests, integration tests, and browser tests using scripts declared in `frontend/package.json`
- [ ] T091 Run AI backend unit and API tests using configuration declared in `backend-ai/pyproject.toml`
- [x] T092 Review Phase 1 exclusions and remove any accidental scheduling, publishing, automatic email sending, autonomous execution, or advanced analytics behavior from `frontend/src/` and `backend-ai/app/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on setup and blocks all stories.
- **US1 Onboarding (Phase 3)**: Starts after foundational work.
- **US2 Contacts (Phase 4)**: Starts after foundational work; can run alongside US1 after workspace mutation contracts are agreed.
- **US3 Pipeline (Phase 5)**: Starts after foundational work; contact-linked paths use US2 but deal and task foundations can proceed in parallel.
- **US4 Campaign Drafts (Phase 6)**: Starts after foundational work; uses US1 business context and can progress alongside US2 and US3.
- **US5 Dashboard (Phase 7)**: Starts after the record-producing stories define their query contracts.
- **Polish (Phase 8)**: Runs after the desired story slices are complete.

### User Story Dependencies

- **US1**: No story dependency; this is the protected workspace foundation.
- **US2**: Uses the authorized workspace context from US1.
- **US3**: Uses workspace context and optionally contacts from US2.
- **US4**: Uses workspace business profile and offers from US1; draft approval remains independently demonstrable.
- **US5**: Reads outputs from US2, US3, and US4 to produce real summaries.

## Parallel Opportunities

- Setup dependency additions and environment templates can be prepared in parallel.
- Frontend and AI-backend foundational work can proceed in parallel after contract agreement.
- Within each story, validation, UI components, and tests marked `[P]` can proceed concurrently.
- After foundational work, US2 CRM, US3 pipeline foundations, and US4 backend campaign orchestration can be assigned to separate developers.
- Documentation and browser-flow preparation can proceed alongside final integration fixes.

## Parallel Example: User Story 4

```text
Task T059: Add AI campaign schema tests in backend-ai/tests/unit/test_campaign_schemas.py
Task T060: Add guardrail tests in backend-ai/tests/unit/test_campaign_guardrails.py
Task T062: Add frontend campaign integration tests in frontend/tests/integration/campaigns.test.ts
Task T063: Define campaign schemas in backend-ai/app/schemas/campaigns.py
Task T066: Implement guardrails in backend-ai/app/guardrails/campaign_content.py
Task T069: Define frontend campaign validation in frontend/src/lib/validations/campaigns.ts
Task T073: Build campaign request form in frontend/src/components/campaigns/campaign-planner-form.tsx
Task T074: Build draft review cards in frontend/src/components/campaigns/draft-review-card.tsx
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 workspace onboarding.
3. Complete US2 contacts.
4. Complete US3 pipeline and follow-ups.
5. Validate the non-AI revenue workspace before introducing AI generation.

### Differentiated Increment

1. Complete US4 supervised campaign drafting.
2. Prove that generated content stays editable, auditable, and approval controlled.
3. Add US5 dashboard summaries once record-producing flows are stable.

### Release Gate

- Workspace isolation regression suite passes.
- No external sending or publishing path exists.
- Campaign generation is idempotent and produces structured drafts.
- Dashboard values match underlying workspace records.
- Critical browser flow passes from onboarding through draft approval.
