# Feature Specification: Phase 4 Agency and Team Features

**Feature Branch**: `not-created (local artifacts only: 005-phase4-agency-team-features)`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing roadmap specification for Phase 4: Agency and Team Features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Multiple Client Workspaces (Priority: P1)

As an agency owner, I want to organize separate client workspaces under my agency so that each client's contacts, campaigns, brand voice, approvals, and reports remain isolated.

**Why this priority**: Multi-client organization is the foundation for targeting agencies and freelancers.

**Independent Test**: An agency owner creates two client workspaces, assigns different client profiles, and verifies that users and records from one client are not visible in the other.

**Acceptance Scenarios**:

1. **Given** an agency account, **When** an authorized owner creates a client workspace, **Then** the client workspace receives its own profile, brand settings, membership, and data boundary.
2. **Given** two client workspaces, **When** a user switches context, **Then** the product clearly identifies the active client and shows only authorized records.
3. **Given** a user without access to a client workspace, **When** the user attempts to open its content, **Then** the system denies access without exposing client data.

---

### User Story 2 - Assign Team Roles and Client Access (Priority: P1)

As an agency owner or admin, I want to invite team members and clients with scoped roles so that each person can complete only the work appropriate to them.

**Why this priority**: Agencies need controlled collaboration across internal staff and external reviewers.

**Independent Test**: An owner invites a marketer and a client reviewer, scopes them to one client workspace, and verifies their allowed and denied actions.

**Acceptance Scenarios**:

1. **Given** an authorized owner or admin, **When** the user invites a team member with selected client access and role, **Then** the invitee can join with the assigned boundaries.
2. **Given** a client reviewer, **When** the reviewer opens the portal, **Then** the reviewer can view, comment on, approve, or reject assigned items without accessing internal-only records.
3. **Given** a role or workspace-access change, **When** it is saved, **Then** later requests enforce the new boundary and the change is audited.
4. **Given** a revoked membership, **When** the former member attempts access, **Then** the system denies access.

---

### User Story 3 - Collect Client Approvals and Comments (Priority: P1)

As an agency marketer, I want clients to review content in a focused portal so that campaign work can move forward without long email threads.

**Why this priority**: A client approval portal removes a common agency workflow bottleneck.

**Independent Test**: A marketer submits scheduled content for review, a client comments and requests changes, the marketer revises it, and the client approves the final version.

**Acceptance Scenarios**:

1. **Given** a reviewable campaign item, **When** an authorized marketer submits it to a client, **Then** the portal shows its preview, due date, status, and comment thread.
2. **Given** a client comment or change request, **When** the marketer revises the item, **Then** the revision history remains visible and prior approval is invalidated.
3. **Given** an approved item, **When** no later edits occur, **Then** the associated schedule or sequence can proceed according to its existing controls.
4. **Given** an internal-only note, **When** a client views the portal, **Then** the note remains hidden.

---

### User Story 4 - Coordinate a Shared Content Calendar (Priority: P2)

As an agency team member or client reviewer, I want a shared calendar filtered to the clients and campaigns I can access so that deadlines and approvals remain clear.

**Why this priority**: Calendar visibility makes multi-client production manageable.

**Independent Test**: A user filters the calendar by client, campaign, status, and assignee and opens a review item from the calendar.

**Acceptance Scenarios**:

1. **Given** authorized client workspaces with planned content, **When** a user opens the shared calendar, **Then** the user sees only permitted items with client, campaign, platform, owner, status, and review state.
2. **Given** multiple calendar items, **When** the user filters the calendar, **Then** the result reflects the selected client, campaign, status, date range, and assignee.
3. **Given** an item needing review, **When** an authorized reviewer opens it, **Then** the review flow is available from the calendar.

---

### User Story 5 - Preserve Client Brand Voices (Priority: P2)

As an agency marketer, I want client-specific brand profiles and voices so that drafts and agent runs use the correct context for each client.

**Why this priority**: Incorrect cross-client voice or context damages trust immediately.

**Independent Test**: A marketer generates drafts for two clients and verifies that each uses only its active client's profile, offers, voice rules, and approved source context.

**Acceptance Scenarios**:

1. **Given** a client workspace, **When** an authorized user updates its brand profile, **Then** later drafts use the updated client-specific context.
2. **Given** a user generating content in one client workspace, **When** the run starts, **Then** context from another client workspace is not used.
3. **Given** missing client brand context, **When** content generation is requested, **Then** the system requests the missing information or warns the user before continuing.

---

### User Story 6 - Deliver White-Label Reports (Priority: P2)

As an agency owner, I want client-facing reports with configurable agency branding so that I can communicate results professionally.

**Why this priority**: Reporting supports client retention and makes the agency plan commercially useful.

**Independent Test**: An owner configures agency branding, generates a client report for a selected period, and verifies that the report contains only approved client-facing metrics.

**Acceptance Scenarios**:

1. **Given** configured agency branding and a client workspace, **When** an authorized user generates a report, **Then** it shows the selected period, approved client-facing metrics, branding, and data-availability notes.
2. **Given** internal-only metrics or notes, **When** the report is generated, **Then** they are excluded unless explicitly made client-visible.
3. **Given** an updated report, **When** the client opens the latest shared version, **Then** the report clearly identifies its generation time and covered period.

### Edge Cases

- A user belongs to an agency and also directly owns an unrelated workspace.
- A staff member is removed while they have pending assignments or approval requests.
- A client reviewer attempts to access an internal note, another client's content, or agency billing.
- A content item is edited after client approval but shortly before scheduled publication.
- An agency attempts to archive a client workspace with active schedules, workflows, or unresolved approvals.
- A client brand profile is incomplete or conflicting instructions are saved.
- A white-label report includes delayed metrics or a metric unavailable for the selected provider.
- An invitation is forwarded, expires, or is accepted by an account different from the intended recipient.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Authorized agency owners MUST be able to create, view, update, archive, and restore client workspaces under an agency account.
- **FR-002**: Each client workspace MUST maintain separate business profile, brand voice, offers, contacts, deals, campaigns, schedules, automations, agent runs, approvals, and reports.
- **FR-003**: Users with access to multiple workspaces MUST be able to switch active context and MUST always see the active client identity prominently.
- **FR-004**: The system MUST prevent active schedules, workflows, or unresolved approvals from being silently abandoned when a client workspace is archived.
- **FR-005**: Authorized owners and admins MUST be able to invite, review, update, and revoke memberships.
- **FR-006**: Membership access MUST support assignment to one or more permitted client workspaces.
- **FR-007**: The system MUST support the README role categories: owner, admin, sales manager, sales rep, marketer, client, and viewer.
- **FR-008**: Role permissions MUST distinguish internal work, client-visible work, approval decisions, team administration, workspace settings, billing, and reporting.
- **FR-009**: Membership invites MUST expire, MUST be attributable to an inviter, and MUST NOT grant access to an unintended account.
- **FR-010**: Membership, role, and workspace-access changes MUST be auditable and effective for later requests.
- **FR-011**: Authorized internal users MUST be able to submit selected content, campaigns, sequences, and reports for client review.
- **FR-012**: Client reviewers MUST be able to view, comment on, approve, reject, and request changes for assigned review items.
- **FR-013**: Review items MUST support due date, status, reviewer, comment thread, revision history, and client-visible preview.
- **FR-014**: Editing an approved item MUST invalidate prior approval and require a new review before protected execution.
- **FR-015**: The system MUST distinguish client-visible comments from internal notes and MUST keep internal notes hidden from client users.
- **FR-016**: Users MUST be able to view a shared content calendar filtered by permitted client workspace, campaign, status, date range, platform, assignee, and review state.
- **FR-017**: Calendar items MUST expose the applicable content, schedule, owner, review state, and next required action.
- **FR-018**: Each client workspace MUST support a client-specific brand profile, audience, offers, content pillars, voice rules, and prohibited language.
- **FR-019**: Draft generation and agent runs MUST use only the active client workspace's authorized context.
- **FR-020**: The system MUST warn users when required client context is incomplete before generating or approving externally visible content.
- **FR-021**: Agency owners MUST be able to configure white-label report branding including agency name, logo, contact details, and permitted display options.
- **FR-022**: Authorized users MUST be able to generate client-facing reports for a selected client and period using approved visible metrics.
- **FR-023**: Reports MUST show covered period, generation time, available data, unavailable data, and selected branding.
- **FR-024**: Client-facing reports MUST exclude internal notes, hidden metrics, cross-client data, and sensitive operational details.
- **FR-025**: The system MUST provide clear guidance for invite, access, approval, archive, brand-context, and report-generation failures.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Agency membership MUST NOT weaken client-workspace isolation; every record and action MUST remain scoped to an explicitly authorized client workspace.
- **STR-002**: Client users MUST be denied internal notes, other clients' records, agency administration, billing controls, and operational secrets.
- **STR-003**: Agent runs and generated content MUST use only the active client's authorized context and MUST record that client workspace.
- **STR-004**: Approval, membership, role, invitation, archive, branding, and report-sharing actions MUST be auditable.
- **STR-005**: White-label reporting MUST expose only approved client-visible data and MUST identify missing or delayed metrics predictably.

### Key Entities *(include if feature involves data)*

- **Agency Account**: A parent business context that organizes client workspaces, agency branding, and agency memberships.
- **Client Workspace**: An isolated client revenue workspace with its own data, brand context, settings, and access list.
- **Agency Membership**: A person's agency role and permitted client workspaces.
- **Invitation**: A time-bounded request for an intended account to join with selected access.
- **Review Item**: A client-visible request to inspect and decide on content, campaigns, sequences, or reports.
- **Review Comment**: A client-visible discussion entry or internal-only note with author and time.
- **Revision**: A preserved version of a reviewable item that invalidates outdated approvals when edited.
- **Shared Calendar Item**: A permitted client-content schedule entry with status, assignee, and review state.
- **Client Brand Profile**: A client-specific audience, offer, voice, content pillars, and prohibited language.
- **White-Label Report**: A client-facing, branded, period-specific report with approved metrics and availability notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An agency owner can create a client workspace, invite a marketer, and assign client access in under 5 minutes.
- **SC-002**: Cross-client access validation shows zero unauthorized record visibility, search results, generated context, or report data.
- **SC-003**: At least 90% of client reviewers can comment on and decide a submitted review item in under 3 minutes without assistance.
- **SC-004**: Editing an approved item invalidates its prior approval in 100% of acceptance-test scenarios.
- **SC-005**: Authorized users can find a client calendar item by client, campaign, status, or assignee in under 30 seconds.
- **SC-006**: Draft-generation validation shows zero use of another client's brand context across isolated test workspaces.
- **SC-007**: At least 95% of report generations complete within 60 seconds or provide a clear recoverable explanation.
- **SC-008**: Client-facing report tests show zero internal-only notes, hidden metrics, cross-client records, or operational secrets.

## Assumptions

- Existing workspace functionality becomes the isolated client-workspace building block for agency accounts.
- Agency users may belong to more than one client workspace and may also have unrelated direct workspace access.
- Client reviewers receive a narrow portal experience and do not inherit internal workspace access.
- Existing approval controls continue to govern scheduled, sent, published, and agent-proposed protected actions.
- White-label reports initially use a controlled set of client-visible metrics rather than arbitrary custom report building.
- Advanced revenue forecasting, attribution, churn detection, growth plans, and benchmarks remain Phase 5 work.

## Scope Boundaries *(mandatory)*

### Included

- Agency accounts and isolated multi-client workspaces
- Team invitations, membership revocation, role boundaries, and client-workspace access scoping
- Client review portal with comments, revision history, approval, rejection, and change requests
- Shared content calendar across authorized clients
- Client-specific brand profiles and context isolation for generated work
- White-label client-facing reports with approved metrics

### Deferred

- Arbitrary custom-role designers beyond the defined role categories
- Marketplace, reseller billing, and complex agency revenue-sharing behavior
- Fully customizable report builders and client-editable analytics models
- Advanced forecasting, attribution, churn prediction, growth plans, and benchmark reports
