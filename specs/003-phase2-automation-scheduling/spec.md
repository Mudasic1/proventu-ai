# Feature Specification: Phase 2 Automation and Scheduling

**Feature Branch**: `not-created (local artifacts only: 003-phase2-automation-scheduling)`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing roadmap specification for Phase 2: Automation and Scheduling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schedule Approved Social Content (Priority: P1)

As a marketer, I want to connect supported social accounts and schedule approved posts so that campaigns can publish reliably without manual posting.

**Why this priority**: Scheduling converts Phase 1 drafts into repeatable campaign execution while preserving human control.

**Independent Test**: A marketer connects an account, approves a post, schedules it, and verifies that the post is published once or receives a recoverable failure.

**Acceptance Scenarios**:

1. **Given** a connected supported account and an approved draft, **When** a marketer selects a valid publish time, **Then** the post enters the schedule with its account, time, and approval record.
2. **Given** a due scheduled post, **When** publishing succeeds, **Then** the post is marked published once and the external reference is recorded.
3. **Given** a publishing failure, **When** the system cannot complete delivery, **Then** the post is not marked published and the user sees a recoverable failure with retry guidance.
4. **Given** an unapproved draft, **When** a user attempts to schedule it, **Then** the system prevents scheduling and directs the user to review it.

---

### User Story 2 - Run Approved Email Sequences (Priority: P1)

As a marketer or sales user, I want to build and activate approved email sequences for eligible contacts so that follow-up happens consistently without reckless outreach.

**Why this priority**: Email sequences create direct revenue value but require consent, review, unsubscribe, bounce, and sending-limit controls.

**Independent Test**: A user creates a sequence, reviews its steps, enrolls an eligible contact, activates it, and verifies that due messages send once while an unsubscribed contact receives none.

**Acceptance Scenarios**:

1. **Given** a reviewed sequence with valid steps and an eligible contact segment, **When** an authorized user activates enrollment, **Then** the system schedules the permitted messages and records the enrollment.
2. **Given** a due sequence message, **When** sending succeeds, **Then** the delivery is recorded once and the next eligible step is scheduled.
3. **Given** a contact who unsubscribed, bounced permanently, or became ineligible, **When** a sequence step becomes due, **Then** the system suppresses the send and records the reason.
4. **Given** a sequence with missing review approval, **When** a user attempts activation, **Then** the system prevents activation.

---

### User Story 3 - Build Simple Revenue Automations (Priority: P1)

As a workspace user, I want to configure simple trigger, condition, action, and approval workflows so that repetitive sales and marketing work is handled consistently.

**Why this priority**: Focused automation is the central Phase 2 retention feature.

**Independent Test**: A user enables a new-lead follow-up workflow, creates a matching lead, and verifies one auditable execution with the expected task and reviewed draft.

**Acceptance Scenarios**:

1. **Given** an enabled workflow with a supported trigger, conditions, and actions, **When** a matching event occurs, **Then** the workflow creates one execution and performs each permitted action once.
2. **Given** an action that sends, publishes, exports, deletes, or replies externally, **When** the action reaches its approval step, **Then** the system waits for an authorized human decision before continuing.
3. **Given** a repeated source event or retry, **When** the workflow is processed again, **Then** completed actions are not duplicated.
4. **Given** a failed workflow action, **When** the user reviews the execution, **Then** the system shows the failed step, safe error summary, and permitted recovery action.

---

### User Story 4 - Prioritize Leads and Suggested Work (Priority: P2)

As a sales user, I want leads scored and follow-up tasks suggested so that I can focus on the opportunities most likely to progress.

**Why this priority**: Prioritization makes the CRM useful as contact volume grows.

**Independent Test**: A user reviews a scored lead, sees the score explanation, accepts a suggested task, and confirms that the task is added once.

**Acceptance Scenarios**:

1. **Given** a lead with relevant profile and engagement data, **When** scoring runs, **Then** the lead receives a current score, classification, explanation, and update time.
2. **Given** a suggested follow-up task, **When** a user accepts it, **Then** the task is created once with a due date and related record.
3. **Given** an inaccurate score or suggestion, **When** a user dismisses or overrides it, **Then** the user decision is recorded and the lead remains editable.

---

### User Story 5 - Review Campaign Performance (Priority: P2)

As a workspace user, I want a dashboard showing campaign, social, email, automation, and pipeline activity so that I can identify what needs attention.

**Why this priority**: Users need evidence that scheduling and automation save time and contribute to revenue activity.

**Independent Test**: With seeded campaign activity, a user opens the dashboard and traces every summary to its underlying records.

**Acceptance Scenarios**:

1. **Given** published posts, sent emails, and automation runs, **When** the user opens performance reporting, **Then** the system shows delivery, engagement, failure, and conversion summaries with the applicable time period.
2. **Given** failed schedules, suppressed emails, or failed workflow actions, **When** the dashboard opens, **Then** priority items are visible with links to the affected records.
3. **Given** a summary metric, **When** the user selects it, **Then** the system opens the supporting records or explains the metric source.

### Edge Cases

- A connected account is revoked after content is scheduled but before it is published.
- A post or email is edited after approval and before delivery.
- A scheduled time falls in the past, crosses daylight-saving changes, or uses a workspace timezone different from the user's timezone.
- An email recipient unsubscribes or permanently bounces between sequence steps.
- Two matching events attempt to start the same workflow execution concurrently.
- An automation recursively triggers itself or exceeds a configured execution limit.
- A provider accepts a delivery request but delays or omits the final outcome.
- Engagement metrics arrive late, more than once, or out of order.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to connect, review, and disconnect supported social and email delivery accounts within an authorized workspace.
- **FR-002**: The system MUST show account health and MUST prevent new delivery attempts through disconnected or invalid accounts.
- **FR-003**: Users MUST be able to schedule an approved social draft for a supported account and valid future time.
- **FR-004**: Editing scheduled social content MUST invalidate its prior approval and require review before publishing.
- **FR-005**: The system MUST publish each due social post no more than once and record its delivery outcome and external reference when available.
- **FR-006**: Users MUST be able to cancel, reschedule, and retry eligible social posts with an auditable history.
- **FR-007**: Users MUST be able to create, edit, review, activate, pause, and archive email sequences.
- **FR-008**: Email sequences MUST support ordered steps, delays, subject, body, personalization fields, eligibility rules, and review state.
- **FR-009**: The system MUST prevent sequence activation until its sendable steps are reviewed and approved.
- **FR-010**: The system MUST suppress email delivery for unsubscribed, permanently bounced, ineligible, or otherwise restricted recipients.
- **FR-011**: The system MUST provide unsubscribe handling, bounce handling, and configurable sending limits before email-sequence execution is enabled.
- **FR-012**: The system MUST record email delivery, suppression, open, click, reply, bounce, and unsubscribe outcomes when available.
- **FR-013**: Users MUST be able to create, review, enable, pause, and archive workflows with a trigger, optional conditions, ordered actions, and approval checkpoints.
- **FR-014**: Phase 2 workflows MUST support the README trigger, condition, and action categories needed for lead follow-up, proposal follow-up, hot-lead alerts, lost-deal recovery, and customer-review requests.
- **FR-015**: Workflows MUST require explicit human approval before sending email, publishing content, replying externally, exporting data, deleting records, or performing another workspace-restricted action.
- **FR-016**: Workflow processing MUST be idempotent so duplicate events, retries, and concurrent execution do not duplicate completed actions.
- **FR-017**: Workflow execution MUST record the source event, matched conditions, action outcomes, approvals, retries, timestamps, and safe errors.
- **FR-018**: The system MUST detect recursive or excessive workflow execution and stop further actions with a visible reason.
- **FR-019**: The system MUST calculate a workspace-scoped lead score and classification from documented signals and show an explanation and update time.
- **FR-020**: Authorized users MUST be able to override a lead score and record the reason.
- **FR-021**: The system MUST surface follow-up task suggestions and MUST require a user decision before adding suggested tasks.
- **FR-022**: The dashboard MUST show scheduled posts, email-sequence activity, workflow outcomes, lead-score priorities, campaign performance, delivery failures, and links to supporting records.
- **FR-023**: Performance reports MUST define the selected time period and distinguish unavailable, delayed, and zero-valued metrics.
- **FR-024**: The system MUST provide clear empty states and recovery guidance for connection, delivery, suppression, workflow, and reporting failures.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Connected-account credentials and delivery permissions MUST remain workspace-scoped and MUST NOT be exposed in user-facing logs or errors.
- **STR-002**: External sends and publishes MUST be authorized, approved where required, auditable, idempotent, and recoverable under retries.
- **STR-003**: The system MUST enforce unsubscribe, suppression, sending-limit, and workspace-permission controls before email delivery.
- **STR-004**: AI task suggestions and lead scores MUST remain explainable and overridable; Phase 2 MUST NOT introduce uncontrolled autonomous agent behavior.

### Key Entities *(include if feature involves data)*

- **Connected Account**: A workspace-authorized social or email delivery connection with health and permission state.
- **Scheduled Post**: An approved social draft, destination account, publish time, delivery state, and outcome history.
- **Email Sequence**: A reviewed multi-step email workflow with eligibility and lifecycle state.
- **Sequence Step**: An ordered email, delay, and personalization configuration.
- **Sequence Enrollment**: A contact's progress and eligibility within a sequence.
- **Suppression Record**: A reason a contact must not receive email.
- **Automation Workflow**: A workspace rule composed of trigger, conditions, ordered actions, and approval checkpoints.
- **Workflow Execution**: An auditable run with source event, step outcomes, retries, and approvals.
- **Lead Score**: A contact prioritization value, classification, explanation, override, and update time.
- **Campaign Performance Snapshot**: Time-bounded delivery, engagement, and conversion summaries linked to supporting activity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 99% of eligible scheduled social posts are published once within 5 minutes of their selected time or show a recoverable failure within that period.
- **SC-002**: Acceptance testing shows zero sends to unsubscribed or permanently bounced contacts.
- **SC-003**: Duplicate-event and retry tests produce zero duplicate posts, emails, tasks, or workflow actions.
- **SC-004**: At least 90% of pilot users can build and enable a supported workflow template in under 10 minutes without assistance.
- **SC-005**: A sales user can identify the top five prioritized leads and accept a suggested follow-up task in under 2 minutes.
- **SC-006**: Users can trace 100% of dashboard delivery and workflow summaries to supporting records or an explicit unavailable-data explanation.
- **SC-007**: Zero externally visible sends, publishes, exports, deletions, or replies occur without the required human approval.
- **SC-008**: At least 80% of pilot workspaces execute one or more enabled schedules, sequences, or automations weekly after activation.

## Assumptions

- Phase 1 workspace, CRM, pipeline, task, campaign, draft, and approval records are available.
- The subscription-credit and AI-job foundation may be delivered separately; Phase 2 task suggestions consume that foundation when AI usage is enabled.
- Initial delivery support may cover a limited set of social and email providers, clearly identified in product messaging.
- Lead scoring starts with documented, explainable workspace signals and supports human override.
- Phase 2 enables supervised external execution, not unrestricted AI autonomy.
- Unified inbox ingestion, multi-agent orchestration, agency portals, and advanced revenue intelligence remain later roadmap work.

## Scope Boundaries *(mandatory)*

### Included

- Supported social and email account connections
- Approved social scheduling and delivery recovery
- Reviewed email sequences, recipient eligibility, suppression, and available engagement tracking
- Focused trigger-condition-action-approval workflows with execution history
- Explainable lead scoring and user-approved task suggestions
- Campaign, schedule, email, automation, and priority dashboard improvements

### Deferred

- Multi-agent orchestration, specialist handoffs, and agent performance metrics
- Full omnichannel inbox and social direct-message ingestion
- Multi-client agency workspaces, client portals, and white-label reporting
- Advanced attribution, forecasting, churn prediction, and benchmark reports
- Unrestricted automatic external actions without human-controlled permission boundaries
