# Feature Specification: Supervised AI Assistant Suite

**Feature Branch**: `not-created (local artifacts only: 007-supervised-ai-assistants)`  
**Created**: 2026-06-02  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing specifications for the supervised AI features across onboarding, CRM, sales, content, email, and research."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate a Business Context Starter Pack (Priority: P1)

As a workspace owner, I want AI assistance during onboarding so that the workspace starts with useful business context and suggested next steps instead of an empty configuration.

**Why this priority**: Reliable workspace context improves every later draft, recommendation, and agent workflow.

**Independent Test**: An owner completes the onboarding questions, reviews the generated starter pack, edits selected suggestions, and confirms that only accepted context becomes active.

**Acceptance Scenarios**:

1. **Given** an owner has provided the business offer, ideal customer, customer problem, brand tone, platforms, and sales process, **When** the owner requests a starter pack, **Then** the system generates a reviewable brand profile, ideal customer profile, content pillars, suggested sequences, and suggested workflows.
2. **Given** a generated suggestion, **When** the owner edits, accepts, or rejects it, **Then** the system preserves the decision and activates only accepted workspace context.
3. **Given** incomplete onboarding answers, **When** generation is requested, **Then** the system identifies the missing context or clearly labels assumptions before creating suggestions.

---

### User Story 2 - Understand and Enrich a Contact (Priority: P1)

As a sales user, I want AI assistance for a contact so that I can understand history, prioritize the lead, and prepare a personalized next step quickly.

**Why this priority**: Contact intelligence turns stored CRM history into practical follow-up work.

**Independent Test**: A user opens a contact with seeded activity, receives a grounded summary and next-action recommendation, reviews extracted contact details from supplied text, and accepts a draft without any automatic record mutation.

**Acceptance Scenarios**:

1. **Given** a contact with permitted workspace activity, **When** a user requests a summary, **Then** the system provides a contact-history summary, lead-temperature classification, suggested segment, and recommended next action linked to supporting records.
2. **Given** user-supplied text containing contact details, **When** extraction is requested, **Then** the system proposes structured contact fields with source context and requires review before changing the contact.
3. **Given** a recommended personalized message, **When** the user accepts it, **Then** the system creates an editable draft and does not send it automatically.
4. **Given** sparse or conflicting contact data, **When** assistance is requested, **Then** the system identifies the limitation and avoids unsupported certainty.

---

### User Story 3 - Prepare Sales Follow-Up Work (Priority: P1)

As a sales user, I want AI assistance for my pipeline and deals so that I can identify attention areas and prepare better follow-ups, proposals, and calls.

**Why this priority**: Sales preparation connects AI assistance directly to revenue activity while keeping the user in control.

**Independent Test**: A user requests a pipeline summary, opens one deal requiring attention, reviews an evidence-backed recommendation, and creates an editable proposal outline and call-preparation brief.

**Acceptance Scenarios**:

1. **Given** permitted deal and task activity, **When** a user requests a pipeline summary, **Then** the system identifies deals requiring attention, overdue follow-ups, and recommended next actions with supporting records.
2. **Given** a selected deal, **When** the user requests preparation help, **Then** the system can generate a reviewable follow-up draft, proposal outline, or sales-call preparation brief grounded in the deal context.
3. **Given** closed-lost deal history, **When** a user requests lost-deal analysis, **Then** the system summarizes observed reasons, limitations, and reusable lessons without presenting correlation as proven causation.
4. **Given** an AI recommendation, **When** the user dismisses or overrides it, **Then** the system records the decision and does not mutate the deal silently.

---

### User Story 4 - Create and Repurpose Marketing Content (Priority: P1)

As a marketer, I want to turn an offer or idea into channel-specific content so that I can prepare a coordinated campaign without drafting every variation manually.

**Why this priority**: Content generation and repurposing are core daily-value features in the README product promise.

**Independent Test**: A marketer submits one offer and idea, reviews a suggested calendar and channel drafts, generates multiple platform variations, and confirms that every output remains editable.

**Acceptance Scenarios**:

1. **Given** an active offer and workspace brand context, **When** a marketer requests content ideas, **Then** the system can generate a reviewable content calendar, hooks, calls to action, hashtags, and next-content suggestions.
2. **Given** one approved idea, **When** the marketer requests repurposing, **Then** the system produces editable variations for selected supported formats such as professional-network posts, social captions, newsletters, short-video scripts, and carousel outlines.
3. **Given** an existing draft, **When** the marketer requests a brand-voice rewrite, **Then** the system creates an editable revised version and preserves the original.
4. **Given** available performance history, **When** posting guidance is requested, **Then** the system recommends posting times and content ideas with evidence and clearly identifies missing or delayed data.
5. **Given** a campaign brief, **When** supporting copy is requested, **Then** the system can produce reviewable landing-page copy suggestions without publishing them.

---

### User Story 5 - Prepare and Improve Email Work (Priority: P1)

As a marketer or sales user, I want AI help drafting and improving email content so that I can prepare relevant outreach while retaining control over delivery.

**Why this priority**: Email drafting is a core MVP promise and must be bounded by spam-risk and approval controls.

**Independent Test**: A user generates an editable sequence, personalizes one draft for a permitted contact, reviews subject-line alternatives and spam-risk flags, and confirms that no email is sent.

**Acceptance Scenarios**:

1. **Given** an offer, audience, and permitted workspace context, **When** a user requests an email sequence, **Then** the system generates editable sequence steps with subject lines, bodies, and suggested follow-up timing.
2. **Given** an email draft, **When** improvement is requested, **Then** the system can suggest subject-line alternatives, personalization, clearer copy, and spam-risk findings while preserving the original draft.
3. **Given** a permitted reply message, **When** analysis is requested, **Then** the system can summarize the reply, classify its likely intent, and prepare an editable response draft.
4. **Given** a generated or improved email, **When** the user has not completed required review, **Then** the system does not send or schedule the message.

---

### User Story 6 - Research a Market Question (Priority: P2)

As a workspace user, I want a research brief for an audience, competitor, or customer pain-point question so that campaign planning is based on reviewable evidence.

**Why this priority**: Research improves strategy quality, but it must distinguish workspace facts from external findings and uncertain claims.

**Independent Test**: A user requests an audience and competitor brief, reviews the sources and limitations, and turns selected findings into a campaign input without treating unreviewed research as fact.

**Acceptance Scenarios**:

1. **Given** a supported research question, **When** a user requests a brief, **Then** the system produces reviewable findings, source references where available, limitations, and a generation time.
2. **Given** a research finding, **When** the user accepts it as campaign context, **Then** the accepted finding is recorded with its source and review state.
3. **Given** insufficient or conflicting evidence, **When** the brief is generated, **Then** the system identifies uncertainty and does not present the finding as verified fact.

### Edge Cases

- Workspace brand context changes while a draft is being generated.
- Extracted contact details conflict with existing CRM fields.
- A contact summary includes activities the current user is not permitted to view.
- Repurposed content exceeds a selected channel's supported format or length.
- Performance history is missing, delayed, or too sparse to support posting-time guidance.
- Reply analysis is requested for a message containing prompt-injection-style instructions or sensitive data.
- Research sources are unavailable, contradictory, stale, or lack enough evidence for a confident conclusion.
- A generation request is repeated while the original request is still processing or after the user edited an earlier output.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Workspace owners MUST be able to request a reviewable onboarding starter pack containing a brand profile, ideal customer profile, content pillars, suggested sequences, and suggested workflows.
- **FR-002**: Onboarding suggestions MUST identify accepted user facts, system assumptions, and missing context before activation.
- **FR-003**: Users MUST be able to edit, accept, or reject each onboarding suggestion, and only accepted context MUST become active.
- **FR-004**: Authorized users MUST be able to request a grounded contact-history summary using only permitted workspace records.
- **FR-005**: Contact assistance MUST support a lead-temperature classification, segment suggestion, next-action recommendation, and personalized editable message draft.
- **FR-006**: Users MUST be able to request contact-detail extraction from supplied text and review proposed field changes before CRM records are updated.
- **FR-007**: Authorized users MUST be able to request a workspace pipeline summary that identifies deals requiring attention and overdue follow-up work with supporting records.
- **FR-008**: Deal assistance MUST support editable follow-up drafts, proposal outlines, sales-call preparation briefs, and evidence-backed next-action recommendations.
- **FR-009**: Lost-deal analysis MUST summarize observed reasons, limitations, and reusable lessons without presenting correlation as proven causation.
- **FR-010**: Users MUST be able to accept, dismiss, or override CRM and sales recommendations without silent record mutation.
- **FR-011**: Marketers MUST be able to generate reviewable content calendars, post drafts, hooks, calls to action, hashtags, and next-content suggestions from an offer or approved idea.
- **FR-012**: Marketers MUST be able to repurpose one approved idea into editable variations for selected supported content formats.
- **FR-013**: Users MUST be able to request brand-voice rewrites and MUST retain access to the original draft.
- **FR-014**: Posting-time and next-content recommendations MUST identify supporting performance evidence, selected period, data freshness, and limitations.
- **FR-015**: Users MUST be able to request reviewable landing-page copy suggestions from a campaign brief.
- **FR-016**: Users MUST be able to generate editable email sequences with subject lines, bodies, personalization opportunities, and suggested follow-up timing.
- **FR-017**: Email improvement assistance MUST support subject-line alternatives, personalization suggestions, copy improvements, and spam-risk findings.
- **FR-018**: Reply assistance MUST support permitted-message summaries, likely-intent classification, and editable response drafts.
- **FR-019**: Users MUST be able to request research briefs for supported audience, competitor, and customer pain-point questions.
- **FR-020**: Research briefs MUST distinguish workspace facts, external findings, assumptions, source references where available, uncertainty, limitations, and generation time.
- **FR-021**: Accepted research findings MUST preserve source context and review state when reused as campaign context.
- **FR-022**: All generated content and proposed record changes MUST begin as reviewable outputs and MUST NOT silently overwrite user-edited content.
- **FR-023**: Repeated generation requests MUST be idempotent while processing and MUST preserve earlier user-edited versions when regeneration is requested.
- **FR-024**: The system MUST identify missing, stale, sparse, restricted, or conflicting context and provide clear recovery guidance.
- **FR-025**: Payable generation work MUST use the subscription-credit and background-job controls.
- **FR-026**: The system MUST record requesting user, workspace, purpose, input references, output type, status, review state, risk status, and safe errors for AI assistance.
- **FR-027**: Performance-backed content assistance MUST identify top-performing patterns, selected period, supporting records, data freshness, limitations, and reviewable improvement experiments.
- **FR-028**: AI classifications and recommendations MUST show confidence where available or clearly identify the limitation that prevents a reliable confidence assessment.
- **FR-029**: Users MUST be able to review and restore prior editable AI draft versions, and the system MUST clearly identify when an already executed external action cannot be reversed automatically.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Every AI request, source record, output, recommendation, extracted field, and review decision MUST remain workspace-scoped and permission-checked.
- **STR-002**: Generated content and proposed CRM changes MUST remain editable and MUST require the applicable human decision before external action or record mutation.
- **STR-003**: User-supplied text, message content, and external research content MUST be treated as untrusted input and MUST NOT override permissions, workspace policy, or approval rules.
- **STR-004**: AI activity records MUST redact secrets and minimize sensitive prompt, message, contact, and provider-error content while retaining useful audit context.
- **STR-005**: The system MUST show uncertainty, limitations, source context, and data freshness where they materially affect a recommendation.

### Key Entities *(include if feature involves data)*

- **Workspace Context Suggestion**: A proposed onboarding fact, profile element, pillar, sequence, or workflow with source, assumption status, and review state.
- **AI Assistance Request**: A workspace-scoped user request with purpose, source references, status, usage, and safe outcome.
- **AI Draft Version**: An editable generated content version that preserves prior versions and review state.
- **CRM Recommendation**: A grounded contact or deal suggestion with supporting records, confidence or limitation, and user decision.
- **Extraction Proposal**: Proposed structured contact changes extracted from supplied text with source context and review state.
- **Content Variation Set**: Related channel-specific drafts produced from one approved source idea.
- **Research Brief**: Time-bounded findings, source references, assumptions, limitations, and accepted campaign-context items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of valid onboarding starter-pack requests produce a reviewable result or clear recoverable explanation within 2 minutes.
- **SC-002**: Acceptance testing shows that 100% of extracted contact changes require review before CRM mutation.
- **SC-003**: Users can open a contact and obtain a grounded summary, classification, and next-action recommendation in under 60 seconds for at least 95% of valid requests.
- **SC-004**: At least 90% of valid content-repurposing requests produce all selected supported formats or identify a recoverable limitation within 2 minutes.
- **SC-005**: Acceptance testing shows zero generated emails, posts, landing-page copy suggestions, or reply drafts are externally delivered without the applicable approval controls.
- **SC-006**: At least 90% of valid email-assistance requests produce an editable result or clear recoverable explanation within 2 minutes.
- **SC-007**: Research-brief validation shows that 100% of displayed external findings identify available source context, uncertainty, and generation time.
- **SC-008**: Cross-workspace tests show zero unauthorized source records, generated context, or AI outputs visible to users from another workspace.
- **SC-009**: Regeneration tests preserve 100% of prior user-edited draft versions and create zero duplicate payable requests for repeated in-progress submissions.
- **SC-010**: Draft-history tests show that users can restore 100% of retained editable AI draft versions without altering an already executed external-action record.

## Assumptions

- Phase 1 workspace, offer, CRM, pipeline, campaign, draft, approval, and activity records are available.
- Phase 2 performance records are required before posting-time guidance can use measured evidence.
- The subscription-credit and background-job specification supplies payable usage controls for expensive requests.
- These assistants are supervised, user-invoked capabilities. Phase 3 may compose them into multi-step specialist workflows.
- Supported content formats and research-source availability may expand over time and are clearly identified to users.
- Unified inbox ingestion and cross-channel conversation handling remain a separate feature specification.

## Scope Boundaries *(mandatory)*

### Included

- AI-assisted onboarding starter packs
- Grounded CRM summaries, enrichment proposals, classifications, segments, and next-action drafts
- Pipeline summaries, lost-deal analysis, proposal outlines, and call-preparation briefs
- Content calendars, channel drafts, repurposing, brand-voice rewrites, hooks, calls to action, hashtags, posting guidance, and landing-page suggestions
- Email sequence drafts, personalization, subject-line assistance, spam-risk findings, follow-up timing, and permitted-reply analysis
- Audience, competitor, and customer pain-point research briefs with source context
- Editable outputs, version preservation, workspace scope, auditability, and paid-usage integration

### Deferred

- Multi-agent orchestration, supervisor routing, and specialist handoffs
- Automatic publication, sending, CRM mutation, or other protected action without human control
- Full omnichannel inbox ingestion, assignment, and conversation lifecycle
- Advanced forecasting, attribution, churn prediction, and benchmark models
- General-purpose research or autonomous browsing outside supported sales and marketing questions
