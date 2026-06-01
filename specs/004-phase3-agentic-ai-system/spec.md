# Feature Specification: Phase 3 Agentic AI System

**Feature Branch**: `not-created (local artifacts only: 004-phase3-agentic-ai-system)`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing roadmap specification for Phase 3: Agentic AI System."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delegate a Revenue Goal to Supervised Agents (Priority: P1)

As a workspace user, I want to describe a sales or marketing goal and receive a structured plan from supervised specialist agents so that I can complete multi-step work without coordinating each draft manually.

**Why this priority**: Multi-step delegation is the product's core differentiator from a standard CRM or content tool.

**Independent Test**: A user requests a campaign for an offer, reviews the proposed plan, starts the run, and receives linked social drafts, email drafts, and follow-up tasks without any unapproved external action.

**Acceptance Scenarios**:

1. **Given** an authorized user and sufficient workspace context, **When** the user submits a supported goal, **Then** the supervisor proposes a reviewable plan with intended specialists, outputs, and approval checkpoints.
2. **Given** an approved plan, **When** the user starts the run, **Then** specialists complete their assigned steps and preserve linked outputs under one run.
3. **Given** missing context or an unsupported request, **When** the user submits the goal, **Then** the system asks for the minimum additional information or explains the unsupported boundary.
4. **Given** a run containing external actions, **When** drafts are ready, **Then** the system pauses at the required approval checkpoints.

---

### User Story 2 - Review and Control Agent Actions (Priority: P1)

As a workspace owner or authorized reviewer, I want an approval queue for risky agent actions so that agents never publish, send, reply, export, delete, or change protected records without permission.

**Why this priority**: Trust requires an explicit control point between agent recommendations and consequential actions.

**Independent Test**: A reviewer approves one queued email send, rejects one publish action, edits another draft, and verifies the recorded decisions and resulting actions.

**Acceptance Scenarios**:

1. **Given** an agent proposes a protected action, **When** the proposal is created, **Then** the action remains pending and appears in the approval queue with context and impact.
2. **Given** a pending action, **When** an authorized reviewer approves it, **Then** the action executes at most once and records the reviewer and outcome.
3. **Given** a rejected or expired action, **When** processing resumes, **Then** the protected action does not execute and the run reflects the decision.
4. **Given** a reviewer edits agent-prepared content, **When** the content is approved, **Then** the approved human version is used.

---

### User Story 3 - Inspect Agent Activity and Recover Failures (Priority: P1)

As a workspace user or operator, I want an understandable activity log for each agent run so that I can inspect progress, recover failures, and trust the result.

**Why this priority**: Agent systems need visible traceability to remain supportable and safe.

**Independent Test**: A user opens a partially failed run, sees each step and handoff, retries the eligible failed step, and verifies one final result without duplicated side effects.

**Acceptance Scenarios**:

1. **Given** an agent run, **When** a user opens its activity log, **Then** the system shows status, specialists, handoffs, approvals, outputs, timestamps, and safe failure summaries.
2. **Given** a retryable failed step, **When** an authorized user retries it, **Then** completed side effects are not repeated and the new attempt is visible.
3. **Given** an in-progress run, **When** the user cancels it, **Then** cancellable work stops safely and the run records what completed before cancellation.

---

### User Story 4 - Receive Pipeline Coaching (Priority: P2)

As a sales user, I want a pipeline coach to identify stale deals, high-value opportunities, and missing follow-ups so that I can focus each week on the best revenue actions.

**Why this priority**: Pipeline coaching connects agent intelligence to a recurring sales workflow.

**Independent Test**: With seeded deal activity, a user runs the pipeline coach and receives a prioritized list with evidence, editable follow-up drafts, and accept-or-dismiss controls.

**Acceptance Scenarios**:

1. **Given** active deals and recent activity, **When** the pipeline coach runs, **Then** it returns a prioritized action list with reasons and supporting records.
2. **Given** a recommended follow-up, **When** a user accepts it, **Then** the related task or draft is created once.
3. **Given** a recommendation the user considers incorrect, **When** the user dismisses it, **Then** the decision is recorded without mutating the deal automatically.

---

### User Story 5 - Optimize Campaign Work (Priority: P2)

As a marketer, I want campaign optimization recommendations based on performance so that future campaigns improve without losing brand control.

**Why this priority**: Optimization closes the loop between execution data and the next campaign plan.

**Independent Test**: A marketer opens a completed campaign, receives evidence-backed recommendations, applies one to a new draft, and confirms the original remains unchanged.

**Acceptance Scenarios**:

1. **Given** campaign performance records, **When** the optimization agent runs, **Then** it identifies useful patterns, limitations, and recommended next experiments.
2. **Given** a recommendation, **When** the marketer applies it, **Then** the system creates or updates a reviewable draft and preserves the original record.
3. **Given** insufficient performance data, **When** optimization is requested, **Then** the system explains the limitation rather than presenting unsupported certainty.

---

### User Story 6 - Manage AI Permissions and Quality Metrics (Priority: P2)

As a workspace owner, I want to configure AI boundaries and review quality metrics so that agent behavior matches my risk tolerance.

**Why this priority**: Workspace policy and observable quality make expanded agent usage governable.

**Independent Test**: An owner disables an action category, starts a related run, and verifies that the run cannot perform that action while the metrics dashboard reflects agent outcomes.

**Acceptance Scenarios**:

1. **Given** workspace AI settings, **When** an owner changes allowed actions or approval rules, **Then** later runs follow the updated policy and the change is audited.
2. **Given** a disallowed action, **When** an agent proposes it, **Then** the system blocks the action and explains the applicable policy.
3. **Given** completed and failed runs, **When** the owner opens AI analytics, **Then** the dashboard shows completion, approval, override, error, and time-saved summaries.

### Edge Cases

- A specialist requests a handoff loop or exceeds the maximum number of steps.
- Workspace policy changes while a run is waiting for approval.
- A run resumes after its related contact, deal, campaign, or draft was edited or removed.
- A user retries a step after the original external action succeeded but its confirmation was delayed.
- A model response contains unsupported claims, sensitive data, unsafe language, or instructions outside the approved scope.
- A reviewer approves an action after its approval request expires.
- A run exhausts its available credits midway through a multi-step plan.
- Metrics are incomplete because a provider outcome or user feedback signal is unavailable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to submit supported sales and marketing goals for supervised multi-step agent execution.
- **FR-002**: The system MUST create a reviewable run plan that identifies intended outputs, specialists, protected actions, expected approval checkpoints, and available cost estimate before execution.
- **FR-003**: Users MUST be able to approve, reject, or revise a proposed run plan before execution begins.
- **FR-004**: The system MUST provide a supervisor capability that routes supported work to appropriate specialist capabilities and records each handoff.
- **FR-005**: Specialist capabilities MUST include the README responsibilities needed for strategy, content, email, CRM, sales, research, analytics, automation suggestions, and compliance review.
- **FR-006**: Each agent run MUST maintain status, initiating user, workspace, goal, plan, step history, outputs, approvals, usage summary, and timestamps.
- **FR-007**: Agent runs MUST enforce bounded steps, bounded handoffs, cancellation, timeout handling, and safe retry behavior.
- **FR-008**: Retrying or resuming a run MUST NOT duplicate completed external actions, approved record changes, or financial usage settlement.
- **FR-009**: The system MUST maintain an approval queue for protected actions proposed by agents.
- **FR-010**: Protected actions MUST include external sends, publishes, customer replies, CRM deletion, billing changes, customer-data export, sensitive-contact messaging, and unsupported-claim publication.
- **FR-011**: Approval requests MUST show the proposed action, affected records, content preview where applicable, risk flags, expiration, and approving permission.
- **FR-012**: Approval decisions MUST record reviewer, decision, edits, time, resulting action, and final outcome.
- **FR-013**: Editing protected content after approval MUST invalidate the prior approval before external execution.
- **FR-014**: The system MUST maintain a user-visible AI activity log with plans, steps, handoffs, approvals, outputs, retries, cancellations, safe errors, and status changes.
- **FR-015**: The system MUST show the source records and workspace context used for material recommendations while minimizing sensitive-data exposure.
- **FR-016**: The compliance capability MUST flag unsupported claims, unsafe language, spam risk, missing approvals, and disallowed actions before external execution.
- **FR-017**: The pipeline coach MUST identify stale deals, high-value opportunities, missing follow-ups, and priority actions with evidence and user-controlled acceptance.
- **FR-018**: The campaign optimization capability MUST produce evidence-backed recommendations, identify data limitations, and create reviewable drafts rather than overwrite approved content silently.
- **FR-019**: Workspace owners MUST be able to configure allowed AI action categories, required approval categories, sensitive-contact boundaries, and actions that are never automatic.
- **FR-020**: Workspace AI policy changes MUST apply to later actions, including actions from in-progress runs that have not executed.
- **FR-021**: The system MUST block disallowed actions even if an agent proposes them or a stale approval previously allowed them.
- **FR-022**: The system MUST report agent-run completion rate, failure rate, approval rate, override rate, regeneration rate, average completion time, and available time-saved estimate.
- **FR-023**: AI quality reports MUST distinguish measured values, estimates, missing data, and user feedback.
- **FR-024**: Agent work MUST use the subscription-credit and background-job controls so insufficient credits stop new payable work predictably.
- **FR-025**: The system MUST provide clear user recovery guidance for missing context, insufficient credits, expired approvals, policy blocks, cancellations, timeouts, and failed steps.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Every agent run, source record, output, approval, activity item, and metric MUST remain workspace-scoped and permission-checked.
- **STR-002**: Protected actions MUST require current policy validation and current user approval immediately before execution.
- **STR-003**: Agent instructions and external content MUST be treated as untrusted input; they MUST NOT override workspace permissions, approval rules, or protected system boundaries.
- **STR-004**: Activity views and logs MUST redact secrets and minimize prompts, outputs, personal data, and provider errors while preserving audit usefulness.
- **STR-005**: Users MUST be able to cancel eligible runs, reject recommendations, override editable outputs, and see when a result is uncertain or incomplete.

### Key Entities *(include if feature involves data)*

- **Agent Run**: A workspace-scoped multi-step goal execution with plan, status, usage, and result.
- **Agent Step**: One bounded specialist activity with inputs, outputs, status, retries, and timing.
- **Agent Handoff**: A recorded delegation from the supervisor or one specialist to another.
- **Agent Output**: A generated plan, summary, recommendation, draft, task suggestion, or protected action proposal.
- **Approval Request**: A pending human-control checkpoint for a protected action.
- **AI Policy**: Workspace boundaries for allowed, approval-required, and prohibited agent actions.
- **Compliance Finding**: A risk flag with reason, severity, related output, and review state.
- **Agent Activity Entry**: A user-visible audit item for plan, step, handoff, approval, retry, cancellation, or outcome.
- **Agent Quality Snapshot**: Time-bounded completion, approval, override, error, and estimated value metrics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of supported campaign-goal runs produce a complete reviewable output set or a clear recoverable explanation within 5 minutes.
- **SC-002**: Acceptance testing shows zero protected actions executed without current workspace policy validation and required human approval.
- **SC-003**: Retry, timeout, and delayed-confirmation tests produce zero duplicated external actions or duplicated final charges.
- **SC-004**: Users can identify the current state, latest completed step, pending approval, and failure reason for an agent run in under 60 seconds.
- **SC-005**: At least 80% of pipeline-coach pilot runs produce one or more recommendations that users accept or explicitly dismiss.
- **SC-006**: At least 80% of pilot users rate the approval queue as clear enough to understand what will happen before approving.
- **SC-007**: Workspace owners can configure a prohibited action and verify its enforcement in under 3 minutes.
- **SC-008**: AI analytics account for 100% of completed, failed, cancelled, and policy-blocked runs within the selected reporting period.

## Assumptions

- Phase 1 revenue records and Phase 2 scheduling, sequence, automation, approval, and performance records are available.
- The subscription-credit and background-job specification supplies payable usage reservation, settlement, rate limiting, and worker recovery.
- Agents are supervised business workers. They do not bypass permissions or become unrestricted autonomous bots.
- Activity views expose useful context and traceability without exposing raw internal reasoning or sensitive secrets.
- The initial specialist set can expand over time while preserving the same approval and traceability boundaries.
- Agency-specific multi-client behavior and advanced revenue-intelligence models remain later phases.

## Scope Boundaries *(mandatory)*

### Included

- Supervisor-led multi-step agent runs with specialist handoffs
- Strategy, content, email, CRM, sales, research, analytics, automation-suggestion, and compliance specialist responsibilities
- Human approval queue and workspace-level AI permission controls
- User-visible AI activity log, cancellation, retries, and safe recovery
- Pipeline coach and campaign optimization agent workflows
- Agent quality, approval, override, failure, and time-saved metrics
- Integration with paid AI-job controls

### Deferred

- Fully autonomous protected actions without workspace policy and approval controls
- Multi-client agency portals, client comments, white-label reports, and client-specific approval experiences
- Advanced forecasting, attribution, churn prediction, growth plans, and benchmark reports
- General-purpose agent behavior outside supported sales and marketing workflows
