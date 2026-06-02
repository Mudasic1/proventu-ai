# Feature Specification: Unified Inbox Intelligence

**Feature Branch**: `not-created (local artifacts only: 008-unified-inbox-intelligence)`  
**Created**: 2026-06-02  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing specification for the unified inbox and its supervised AI conversation features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review Workspace Conversations in One Inbox (Priority: P1)

As a workspace user, I want supported customer conversations in one inbox so that I can review and manage communication without switching between disconnected tools.

**Why this priority**: A usable inbox requires a reliable, workspace-scoped conversation record before intelligence or automation can add value.

**Independent Test**: A user opens the inbox, filters seeded conversations from supported channels, opens one thread, and confirms its messages, source, assignment, and status.

**Acceptance Scenarios**:

1. **Given** supported connected channels and permitted workspace messages, **When** the user opens the inbox, **Then** the system shows conversations with channel, contact where known, status, priority, assignee, unread state, and latest activity time.
2. **Given** a selected conversation, **When** the user opens it, **Then** the system shows ordered messages, available source references, internal notes, and related CRM records without exposing another workspace's data.
3. **Given** an unsupported or unavailable channel capability, **When** the user reviews the inbox, **Then** the system identifies the limitation rather than implying complete coverage.

---

### User Story 2 - Triage a Conversation with AI Assistance (Priority: P1)

As a workspace user, I want a conversation summary and intent signals so that I can understand priority messages quickly and choose the next action.

**Why this priority**: Triage is the highest-value AI addition to an inbox and can remain advisory.

**Independent Test**: A user opens a seeded conversation, requests analysis, sees a grounded summary and signals, and verifies that the original thread remains unchanged.

**Acceptance Scenarios**:

1. **Given** a permitted conversation with messages, **When** AI analysis is requested, **Then** the system provides a summary, likely buying intent, customer-sentiment or complaint-risk signal, priority suggestion, and supporting message references.
2. **Given** insufficient, ambiguous, or conflicting message evidence, **When** analysis is requested, **Then** the system identifies uncertainty and avoids unsupported conclusions.
3. **Given** an inaccurate signal, **When** the user dismisses or overrides it, **Then** the user decision is recorded and the conversation remains user-controlled.

---

### User Story 3 - Prepare and Approve a Reply (Priority: P1)

As a workspace user, I want AI to draft a reply while requiring review before sending so that I can respond faster without losing control of external communication.

**Why this priority**: Reply drafting is useful only when the system preserves human approval and delivery safeguards.

**Independent Test**: A user generates a reply draft, edits it, approves it for a supported channel, and verifies one auditable delivery outcome.

**Acceptance Scenarios**:

1. **Given** a permitted conversation, contact context, and healthy connected account, **When** a user requests a reply draft, **Then** the system creates editable reply content with relevant context and risk findings.
2. **Given** an editable reply draft, **When** a user changes its content, **Then** the system preserves the edited version and requires the applicable approval before sending.
3. **Given** an approved reply and an eligible destination, **When** delivery is requested, **Then** the message is sent no more than once and the outcome is recorded.
4. **Given** a restricted contact, unhealthy connection, missing permission, or policy block, **When** sending is requested, **Then** the system prevents delivery and explains the recoverable next step.

---

### User Story 4 - Turn a Message into Revenue Work (Priority: P1)

As a sales user, I want to turn a conversation into CRM records and follow-up work so that promising messages are not lost.

**Why this priority**: Inbox value increases when conversations can enter the existing revenue workflow.

**Independent Test**: A user opens an unlinked conversation, reviews proposed contact details, creates a contact and deal, adds a follow-up task, and confirms that repeated actions do not create duplicates.

**Acceptance Scenarios**:

1. **Given** a conversation without a linked contact, **When** a user chooses to create a lead, **Then** the system proposes available contact details for review before creating one workspace contact.
2. **Given** a linked contact, **When** a user chooses to create a deal or task from the conversation, **Then** the system creates the selected record once and links it to the conversation.
3. **Given** a repeated create action or retry, **When** processing resumes, **Then** the system does not create duplicate contacts, deals, or tasks.

---

### User Story 5 - Assign and Manage Conversation Work (Priority: P2)

As a team member, I want conversations assigned and tracked by status and priority so that the team can coordinate follow-up work.

**Why this priority**: Assignment and status make the inbox operational for teams after the core read-and-reply flow works.

**Independent Test**: A user assigns a conversation, changes its status and priority, adds an internal note, and confirms that another authorized team member can find the updated thread.

**Acceptance Scenarios**:

1. **Given** an unassigned conversation, **When** an authorized user assigns it to a permitted team member, **Then** the assignee and assignment history are recorded.
2. **Given** an active conversation, **When** an authorized user changes status or priority, **Then** the inbox reflects the update and records the actor and time.
3. **Given** an internal note, **When** a workspace user adds it, **Then** the note is visible only to permitted internal users and is never sent externally.

---

### User Story 6 - Review Inbox Performance and Failures (Priority: P2)

As a workspace owner, I want inbox activity and failure summaries so that I can identify delayed replies, delivery issues, and workload bottlenecks.

**Why this priority**: Operational visibility is required before the inbox can support larger message volumes.

**Independent Test**: An owner opens inbox reporting, traces summary values to conversations, and finds failed or overdue items with recovery guidance.

**Acceptance Scenarios**:

1. **Given** conversation, assignment, reply, and delivery activity, **When** the owner opens inbox reporting, **Then** the system shows selected-period volume, response timing, open-work, assignment, and failure summaries with supporting records.
2. **Given** delayed or unavailable metrics, **When** reporting opens, **Then** the system distinguishes unavailable, delayed, and zero-valued metrics.
3. **Given** a failed reply delivery or ingestion issue, **When** the user opens the affected record, **Then** the system shows a safe failure summary and recoverable next step.

### Edge Cases

- A supported channel does not permit reply sending, direct-message ingestion, or historical backfill.
- The same external message is delivered more than once or arrives out of order.
- A conversation cannot be linked confidently to one contact.
- A contact unsubscribes or becomes restricted after a reply draft is approved but before delivery.
- A connected account becomes unhealthy while a reply is waiting for approval.
- A message contains sensitive information, unsafe language, unsupported claims, or prompt-injection-style instructions.
- An internal note is accidentally selected while a user is preparing an external reply.
- A conversation is reassigned or closed while another user is viewing it.
- AI triage is requested for a very long thread or one with unavailable attachments.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Authorized users MUST be able to review workspace conversations from supported email replies, social comments, social direct messages where available, lead forms, contact messages, and internal notes.
- **FR-002**: The inbox MUST show channel, contact where known, status, priority, assignee, unread state, and latest activity time for each conversation.
- **FR-003**: Users MUST be able to filter conversations by supported channel, status, priority, assignee, unread state, related contact, and date range.
- **FR-004**: Conversation threads MUST preserve ordered message history, source reference where available, direction, delivery state, sender context, and time.
- **FR-005**: The system MUST identify channel limitations, unavailable capabilities, delayed ingestion, and unavailable history clearly.
- **FR-006**: Authorized users MUST be able to request a grounded conversation summary using only permitted thread and workspace context.
- **FR-007**: Conversation analysis MUST support likely buying-intent, complaint-risk or customer-sentiment, priority, and next-action suggestions with uncertainty and supporting-message context.
- **FR-008**: Users MUST be able to dismiss or override AI conversation signals and record the user decision.
- **FR-009**: Authorized users MUST be able to request an editable reply draft for a permitted conversation.
- **FR-010**: Reply drafts MUST show applicable risk findings and MUST remain editable before sending.
- **FR-011**: External replies MUST require current workspace permission, current policy validation, applicable human approval, an eligible recipient, and a healthy supported delivery connection.
- **FR-012**: Editing an approved reply draft MUST invalidate the earlier approval before delivery.
- **FR-013**: Reply delivery MUST be idempotent and MUST record the final outcome, external reference where available, time, and safe error where applicable.
- **FR-014**: Users MUST be able to propose and review contact details from an unlinked conversation before creating or updating a CRM contact.
- **FR-015**: Authorized users MUST be able to create and link a deal or follow-up task from a conversation.
- **FR-016**: Repeated create actions and retries MUST NOT duplicate linked contacts, deals, tasks, or external replies.
- **FR-017**: Authorized users MUST be able to assign conversations to permitted team members and change conversation status and priority.
- **FR-018**: The system MUST record assignment, status, priority, related-record, approval, reply, and delivery changes in conversation activity history.
- **FR-019**: Authorized internal users MUST be able to add internal notes that are visually distinct and MUST never be sent externally.
- **FR-020**: Inbox reporting MUST show selected-period conversation volume, open work, assignment, response timing, reply outcomes, ingestion failures, and delivery failures with links to supporting records.
- **FR-021**: Reporting MUST distinguish unavailable, delayed, and zero-valued metrics.
- **FR-022**: The system MUST provide clear recovery guidance for ingestion, identity matching, assignment, approval, connection, delivery, and AI-analysis failures.
- **FR-023**: Payable conversation analysis and reply-drafting work MUST use the subscription-credit and background-job controls.
- **FR-024**: The system MUST record requesting user, workspace, purpose, source conversation, output type, review state, risk status, and safe errors for inbox AI assistance.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Every conversation, message, note, source record, AI output, assignment, approval, and activity item MUST remain workspace-scoped and permission-checked.
- **STR-002**: External replies MUST remain human-controlled, auditable, idempotent, and recoverable under retries or delayed delivery confirmation.
- **STR-003**: Message content and external channel payloads MUST be treated as untrusted input and MUST NOT override permissions, workspace policy, approval rules, or protected boundaries.
- **STR-004**: Internal notes MUST be separated from external reply content and MUST never be delivered to customer channels.
- **STR-005**: Logs, reporting, and activity views MUST redact secrets and minimize sensitive message, contact, attachment, and provider-error content while preserving audit usefulness.
- **STR-006**: Reply delivery MUST continue to enforce suppression, restriction, and connected-account health controls immediately before sending.

### Key Entities *(include if feature involves data)*

- **Conversation**: A workspace-scoped communication thread with channel, contact link, status, priority, assignment, and activity time.
- **Conversation Message**: One inbound, outbound, or internal thread entry with source, direction, delivery state, sender context, and time.
- **Inbox Assignment**: A conversation ownership record with assignee, actor, time, and history.
- **Conversation AI Insight**: A summary, intent signal, sentiment or complaint-risk signal, priority suggestion, or next action with supporting context and user decision.
- **Reply Draft**: Editable proposed external content with risk findings, approval state, delivery eligibility, and version history.
- **Conversation Link**: A relationship between a conversation and a contact, deal, or follow-up task.
- **Inbox Performance Snapshot**: Time-bounded operational summaries with data-availability state and supporting records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and open a permitted conversation by status, assignee, contact, or channel in under 30 seconds.
- **SC-002**: At least 95% of valid conversation-analysis requests produce a grounded summary and signals or a clear recoverable explanation within 60 seconds.
- **SC-003**: Acceptance testing shows zero external replies sent without current permission, applicable approval, eligible-recipient validation, and connected-account health validation.
- **SC-004**: Duplicate-ingestion and retry tests produce zero duplicate messages, linked CRM records, follow-up tasks, deals, or external reply deliveries.
- **SC-005**: Cross-workspace validation shows zero unauthorized conversation, message, note, AI output, or reporting visibility.
- **SC-006**: Internal-note tests show zero internal notes delivered externally across all supported channels.
- **SC-007**: At least 90% of permitted reply deliveries complete once or show a clear recoverable failure within 5 minutes.
- **SC-008**: Users can create and link a contact, deal, or follow-up task from a conversation in under 2 minutes.
- **SC-009**: Users can trace 100% of displayed inbox-reporting summaries to supporting records or an explicit unavailable-data explanation.

## Assumptions

- Phase 1 workspace, CRM, deals, tasks, activity history, drafts, and approval records are available.
- Phase 2 connected-account, suppression, sending-limit, scheduling, delivery, and recovery controls are available.
- The supervised AI assistant suite supplies reusable message-summary, reply-analysis, and reply-drafting behavior.
- The subscription-credit and background-job specification supplies payable usage controls.
- Initial channel support may be limited by provider capabilities and is clearly communicated to users.
- Advanced agency-client visibility rules reuse the client-workspace isolation defined by Phase 4.

## Scope Boundaries *(mandatory)*

### Included

- Unified inbox for supported email replies, social comments, social direct messages where available, forms, contact messages, and internal notes
- Conversation search, filtering, status, priority, assignment, and activity history
- Grounded summaries, intent and complaint-risk signals, priority suggestions, and editable reply drafts
- Human-approved, policy-checked, idempotent reply delivery for supported channels
- Reviewable contact extraction and links from conversations to contacts, deals, and tasks
- Inbox performance summaries, safe failures, workspace isolation, sensitive-data minimization, and paid-usage integration

### Deferred

- Unsupported provider capabilities and guaranteed historical backfill for every channel
- Fully autonomous customer replies without current policy validation and required human approval
- Voice-call transcription, live call assistance, and unrestricted attachment understanding
- General-purpose customer-support ticketing features outside the revenue-workspace use case
- Advanced cross-client agency inbox routing beyond existing workspace permissions
