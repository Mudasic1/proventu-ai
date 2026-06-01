# Feature Specification: Phase 1 Core Revenue Workspace

**Feature Branch**: `not-created (local artifacts only: 001-phase1-revenue-workspace)`  
**Created**: 2026-05-30  
**Status**: Draft  
**Input**: User description: "Read README.md and create a spec for the Phase 1 full-stack system with tasks and a checklist."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Up a Revenue Workspace (Priority: P1)

As a small service business owner or agency operator, I want to create my business workspace and record the essential context about my offer, audience, and brand voice so that the product is ready to support my sales and marketing work.

**Why this priority**: Every contact, deal, campaign, and AI-assisted draft must be associated with a business workspace and grounded in the user's business context.

**Independent Test**: A new user can complete onboarding, access a protected workspace, and review the saved business profile without using any other Phase 1 feature.

**Acceptance Scenarios**:

1. **Given** a signed-in user without a workspace, **When** the user submits the required business profile details, **Then** the system creates a workspace, associates the user with it, and opens the workspace dashboard.
2. **Given** a signed-in user with an existing workspace, **When** the user returns to the product, **Then** the user can access that workspace without repeating onboarding.
3. **Given** a user who is not signed in, **When** the user attempts to access workspace content, **Then** the system prevents access and directs the user to sign in.
4. **Given** an onboarding form with missing required details, **When** the user attempts to continue, **Then** the system identifies the missing information and preserves valid entries.

---

### User Story 2 - Manage CRM Contacts (Priority: P1)

As a workspace user, I want to add, edit, search, filter, and remove contacts so that I can keep an accurate list of leads and customers for follow-up.

**Why this priority**: Contacts are the core revenue records used by pipeline tracking and personalized follow-up work.

**Independent Test**: A workspace user can maintain a contact list and see contact history while data from another workspace remains inaccessible.

**Acceptance Scenarios**:

1. **Given** an authorized workspace user, **When** the user adds a contact with valid details, **Then** the contact appears in the workspace contact list with its source and current status.
2. **Given** an existing contact, **When** the user updates contact details or adds a note, **Then** the latest information and a dated activity entry are visible.
3. **Given** multiple contacts, **When** the user searches or filters the list, **Then** the system returns the matching workspace contacts.
4. **Given** a likely duplicate contact, **When** the user attempts to add it, **Then** the system warns the user and offers a deliberate choice to review or continue.
5. **Given** a contact removal request, **When** the user has not confirmed the action, **Then** the contact remains available.

---

### User Story 3 - Track Deals and Follow-Ups (Priority: P1)

As a workspace user, I want to track deals through a simple sales pipeline and create follow-up tasks so that I know which opportunities need attention.

**Why this priority**: The Phase 1 promise includes organizing leads and telling users who to follow up with next.

**Independent Test**: A workspace user can create a deal, move it through stages, record a won or lost outcome, and manage a due follow-up task without generating a campaign.

**Acceptance Scenarios**:

1. **Given** a workspace with a contact, **When** the user creates a deal, **Then** the deal appears in the selected pipeline stage with value, owner, and expected close date when provided.
2. **Given** an open deal, **When** the user moves it to a different stage, **Then** the current stage changes and the activity timeline records the movement.
3. **Given** an open deal, **When** the user marks it lost, **Then** the system requires a lost reason.
4. **Given** an open deal, **When** the user marks it won, **Then** the system records the close date.
5. **Given** a contact or deal, **When** the user creates a follow-up task, **Then** the task records its due date, owner, status, and relationship to the relevant revenue record.
6. **Given** overdue or inactive deals, **When** the user reviews priorities, **Then** the system identifies deals that need follow-up.

---

### User Story 4 - Generate and Approve Campaign Drafts (Priority: P1)

As a workspace user, I want AI assistance to create a campaign plan with social and email drafts based on my business profile and offer so that I can prepare outreach faster while retaining control over external communication.

**Why this priority**: This is the first differentiated product moment and must remain supervised to protect user trust.

**Independent Test**: A workspace user can request a campaign plan, receive editable social and email drafts, approve or reject each draft, and confirm that nothing is sent or published automatically.

**Acceptance Scenarios**:

1. **Given** a completed workspace profile and an offer, **When** the user requests a campaign plan with a goal and audience, **Then** the system creates a campaign plan with editable draft content.
2. **Given** generated social and email drafts, **When** the user edits a draft, **Then** the system preserves the user's version and does not silently overwrite it.
3. **Given** a draft awaiting review, **When** the user approves or rejects it, **Then** the system records the decision and reviewer.
4. **Given** a generated campaign, **When** the user has not explicitly approved a draft, **Then** the system does not send an email or publish a social post.
5. **Given** a campaign generation failure, **When** the request cannot be completed, **Then** the user receives a clear failure message and can retry without duplicate campaign records.

---

### User Story 5 - Review the Daily Revenue Snapshot (Priority: P2)

As a workspace user, I want a dashboard that summarizes active revenue work so that I can choose the next action without reviewing every record individually.

**Why this priority**: The dashboard proves that the workspace connects CRM, pipeline, tasks, and campaign preparation into a useful daily routine.

**Independent Test**: With seeded workspace data, a user can review accurate summary cards and open the underlying records from the dashboard.

**Acceptance Scenarios**:

1. **Given** a workspace with contacts, deals, tasks, and campaigns, **When** the user opens the dashboard, **Then** the dashboard shows current counts and values derived from those records.
2. **Given** overdue follow-ups or inactive deals, **When** the dashboard is opened, **Then** the user can identify the priority records requiring attention.
3. **Given** a dashboard summary item, **When** the user selects it, **Then** the system opens the corresponding filtered record list or detail view.
4. **Given** a new workspace with no revenue records, **When** the dashboard is opened, **Then** the user sees a useful empty state with the next setup action.

### Edge Cases

- A user belongs to a workspace but the workspace profile is incomplete.
- Two users attempt to update the same contact, deal, task, or draft close together.
- A contact import contains invalid rows, missing names, or likely duplicates.
- A deal is moved directly to won or lost from an early stage.
- A task due date is in the past when it is created or edited.
- A campaign request is repeated after a timeout or an unclear response.
- Generated content includes unsupported claims, risky language, or missing context.
- A user attempts to view or change a record owned by another workspace.
- Dashboard calculations run for a workspace with no records or partially completed records.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require a signed-in user before allowing access to workspace content.
- **FR-002**: The system MUST guide a signed-in user without a workspace through onboarding before granting access to workspace features.
- **FR-003**: Users MUST be able to create and update a workspace profile containing business name, industry, target audience, brand voice, products or services, offers, sales process, and AI preference boundaries.
- **FR-004**: The system MUST associate each business record with exactly one workspace and prevent users from accessing records outside their authorized workspace.
- **FR-005**: Users MUST be able to create, view, edit, search, filter, and remove contacts within their workspace.
- **FR-006**: Contact records MUST support name, contact methods, company, source, status, tags, notes, owner, and dated activity history where applicable.
- **FR-007**: The system MUST warn users when a new or imported contact appears to duplicate an existing workspace contact.
- **FR-008**: Users MUST be able to import contacts from a structured file and receive a summary of accepted, rejected, and duplicate rows.
- **FR-009**: Contact removal MUST require an explicit confirmation and MUST create an auditable record of the action.
- **FR-010**: Each new workspace MUST receive a basic sales pipeline with the stages New Lead, Contacted, Qualified, Meeting Booked, Proposal Sent, Negotiation, Won, and Lost.
- **FR-011**: Users MUST be able to create, view, edit, and move deals through pipeline stages.
- **FR-012**: Deal records MUST support a title, related contact or company, current stage, value, expected close date, owner, notes, and dated activity history.
- **FR-013**: The system MUST record every deal stage change in the activity history.
- **FR-014**: Marking a deal as lost MUST require a lost reason.
- **FR-015**: Marking a deal as won MUST record a close date.
- **FR-016**: Users MUST be able to create, assign, update, complete, and review follow-up tasks related to contacts or deals.
- **FR-017**: Follow-up tasks MUST support title, due date, owner, status, priority, and related revenue record.
- **FR-018**: The system MUST identify overdue tasks and inactive deals that require user attention.
- **FR-019**: Users MUST be able to define an offer and request a campaign plan for a specified goal and target audience.
- **FR-020**: A generated campaign plan MUST include a campaign summary, recommended angle, social post drafts, email drafts, and suggested follow-up tasks.
- **FR-021**: Generated social and email content MUST begin as editable drafts.
- **FR-022**: The system MUST preserve human edits to drafts and MUST NOT silently overwrite user-edited content during regeneration.
- **FR-023**: Users MUST be able to approve or reject individual generated drafts.
- **FR-024**: The system MUST record the review decision, reviewer, and review time for each approval item.
- **FR-025**: The system MUST NOT send emails or publish social posts automatically during Phase 1.
- **FR-026**: The system MUST identify generated content that may contain unsupported claims or risky language and require the user to review those concerns.
- **FR-027**: Repeated campaign generation requests MUST not create duplicate campaign results when the original request is still processing or has already completed.
- **FR-028**: Users MUST be able to review a dashboard showing leads, pipeline value, overdue follow-ups, inactive deals, active campaigns, pending approvals, and recent activity for their workspace.
- **FR-029**: Dashboard summaries MUST be derived from workspace records and MUST provide a path to the underlying records.
- **FR-030**: The system MUST provide useful empty states and clear recovery guidance when records are absent or an operation fails.
- **FR-031**: The system MUST maintain an auditable history for sensitive actions, including contact removal, deal stage movement, generated draft creation, and approval decisions.
- **FR-032**: The system MUST present predictable, user-friendly errors without exposing private system details.
- **FR-033**: The system MUST support a usable desktop and mobile web experience for the Phase 1 journeys.
- **FR-034**: The system MUST restrict Phase 1 AI behavior to supervised planning, drafting, risk flagging, and follow-up suggestions.

### Key Entities

- **Workspace**: A business account containing the profile and boundaries that scope all Phase 1 data.
- **User**: A signed-in person associated with a workspace.
- **Workspace Membership**: The relationship granting a user access to a workspace.
- **Business Profile**: The workspace's industry, audience, brand voice, offer, sales process, and AI preferences.
- **Contact**: A lead or customer with identity, communication details, source, ownership, and activity history.
- **Company**: An organization associated with one or more contacts and deals.
- **Contact Import**: A structured contact upload and its accepted, rejected, and duplicate row summary.
- **Pipeline**: A workspace's ordered sales process.
- **Stage**: A named position in a pipeline.
- **Deal**: A revenue opportunity related to a contact or company.
- **Task**: A follow-up action with owner, priority, due date, and status.
- **Campaign**: A marketing initiative connected to an offer, goal, and target audience.
- **Social Draft**: Editable social content prepared for human review.
- **Email Draft**: Editable email content prepared for human review.
- **Approval**: A recorded human decision for a draft or sensitive action.
- **Activity Entry**: A dated audit item describing a relevant workspace event.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time users can complete workspace onboarding and reach the dashboard in under 5 minutes without assistance.
- **SC-002**: At least 95% of users can add a contact and create a related deal in under 3 minutes on their first attempt.
- **SC-003**: Users can find a contact from a workspace containing 10,000 contacts in under 2 seconds for at least 95% of searches.
- **SC-004**: Users can identify overdue follow-ups and inactive deals from the dashboard in under 30 seconds.
- **SC-005**: At least 90% of valid campaign planning requests produce a reviewable campaign plan and draft set within 60 seconds.
- **SC-006**: Zero emails or social posts are externally sent or published without an explicit human approval action during Phase 1.
- **SC-007**: Zero records from one workspace are visible or editable by a user authorized only for another workspace during access-control validation.
- **SC-008**: Dashboard summary values match the underlying workspace records in 100% of acceptance-test scenarios.
- **SC-009**: At least 80% of pilot users rate the campaign draft review flow as clear and controllable.
- **SC-010**: A workspace user can complete the core weekly workflow, from contact entry through deal follow-up and campaign draft approval, without using an external spreadsheet.

## Assumptions

- Phase 1 is intended for small service businesses and agencies with one primary workspace per signed-in user.
- Phase 1 uses a simple workspace membership model; complex team permissions, client portals, billing permissions, and multi-brand management are deferred.
- Authentication is part of the full-stack foundation and may reuse the repository's existing authentication work.
- Contact import supports a structured file format suitable for tabular contact data; export is deferred.
- Companies are represented where needed for contact and deal context, but advanced company management is deferred.
- Social posts and emails remain drafts in Phase 1. Scheduling, publishing, automated sending, deliverability analytics, and external account connections are deferred.
- AI assistance is supervised. Phase 1 does not include autonomous multi-agent workflows, an automation builder, or automatic record mutation beyond explicitly requested draft and task creation.
- Basic dashboard metrics are operational summaries, not advanced attribution, forecasting, or performance analytics.
- Activity history supports auditability for the core Phase 1 flows; a full AI activity log and agent performance reporting are deferred.
- The target experience is responsive web access rather than separate native mobile applications.

## Out of Scope

- Social account connection, scheduling, and publishing
- Email account connection, automatic sending, sequence execution, and tracking
- Workflow automation builder
- Unified inbox and social direct-message handling
- Advanced team roles, client approval portal, white labeling, and multi-client workspaces
- Multi-agent orchestration, agent handoffs, advanced agent analytics, and autonomous execution
- Advanced attribution, revenue forecasting, campaign optimization, and enterprise compliance
- Billing and pricing-plan enforcement
