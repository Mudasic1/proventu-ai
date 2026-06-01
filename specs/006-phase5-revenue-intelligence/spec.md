# Feature Specification: Phase 5 Advanced Revenue Intelligence

**Feature Branch**: `not-created (local artifacts only: 006-phase5-revenue-intelligence)`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "Read README.md and create the missing roadmap specification for Phase 5: Advanced Revenue Intelligence."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review a Revenue Forecast (Priority: P1)

As a business owner or sales manager, I want a forecast with ranges, drivers, and confidence so that I can plan revenue work without treating uncertain estimates as facts.

**Why this priority**: Forecasting is the central move from workflow automation to decision support.

**Independent Test**: A manager opens a forecast for a selected period, inspects expected revenue and uncertainty, drills into contributing deals, and adjusts an eligible assumption.

**Acceptance Scenarios**:

1. **Given** sufficient current and historical revenue activity, **When** a manager opens a forecast, **Then** the system shows expected revenue, a range, confidence, major drivers, and covered period.
2. **Given** a forecast driver, **When** the user selects it, **Then** the underlying deals, stages, activities, and assumptions are visible.
3. **Given** insufficient or stale data, **When** the forecast is requested, **Then** the system identifies the limitation and avoids false precision.
4. **Given** an eligible user adjustment, **When** an assumption changes, **Then** the adjusted view is distinguishable from the system view.

---

### User Story 2 - Understand Marketing Attribution Insights (Priority: P1)

As a marketer or owner, I want evidence-backed attribution insights so that I can understand which campaigns and touchpoints appear to contribute to revenue.

**Why this priority**: Revenue-focused analytics are part of the product moat, but attribution must communicate uncertainty honestly.

**Independent Test**: A marketer reviews a won deal, sees contributing touchpoints and the selected attribution view, changes the view, and verifies that source records remain traceable.

**Acceptance Scenarios**:

1. **Given** linked campaign, contact, and deal activity, **When** attribution is opened, **Then** the system shows contributing touchpoints, selected attribution view, covered period, and data limitations.
2. **Given** a different supported attribution view, **When** the user selects it, **Then** summaries update and preserve links to source activity.
3. **Given** incomplete tracking, **When** attribution insights are shown, **Then** the system labels them as partial rather than claiming complete causation.

---

### User Story 3 - Identify Risky Deals (Priority: P1)

As a sales user, I want deal-risk predictions with reasons and suggested actions so that I can intervene before opportunities are lost.

**Why this priority**: Deal-risk guidance turns pipeline history into practical next actions.

**Independent Test**: A user reviews an at-risk deal, sees its risk factors, accepts a follow-up suggestion, and records feedback on the prediction.

**Acceptance Scenarios**:

1. **Given** an open deal with relevant signals, **When** risk analysis runs, **Then** the deal receives a risk level, confidence, factors, and update time.
2. **Given** an at-risk deal, **When** the user accepts a recommended next action, **Then** the related task or draft is created once.
3. **Given** an inaccurate prediction, **When** the user records feedback or an override, **Then** the feedback is preserved and the deal remains user-controlled.

---

### User Story 4 - Run Customer Retention Workflows (Priority: P2)

As a workspace user, I want churn-risk signals and supervised retention workflows so that I can recover inactive customers and protect revenue.

**Why this priority**: Retention expands the platform beyond lead acquisition and deal closing.

**Independent Test**: A user reviews a churn-risk customer, approves a re-engagement workflow, and verifies that suppressed or ineligible contacts receive no outreach.

**Acceptance Scenarios**:

1. **Given** customer activity and permitted signals, **When** retention analysis runs, **Then** the system identifies churn-risk customers with reasons and confidence.
2. **Given** an eligible customer, **When** a user approves a retention workflow, **Then** reviewed tasks and outreach follow existing approval, suppression, and delivery controls.
3. **Given** an ineligible or restricted contact, **When** retention execution reaches outreach, **Then** the outreach is suppressed and the reason is recorded.

---

### User Story 5 - Generate a Growth Plan (Priority: P2)

As a business owner, I want an AI-generated growth plan grounded in my workspace performance so that I can prioritize the next actions across sales and marketing.

**Why this priority**: Growth plans deliver the roadmap promise of actionable revenue intelligence.

**Independent Test**: An owner requests a monthly growth plan and receives prioritized actions linked to evidence, owners, expected outcomes, and reviewable follow-up work.

**Acceptance Scenarios**:

1. **Given** available workspace performance data, **When** the owner requests a growth plan, **Then** the system produces prioritized actions, evidence, expected outcomes, and identified limitations.
2. **Given** a proposed action, **When** the user accepts it, **Then** the system creates the applicable task, campaign brief, or reviewable workflow once.
3. **Given** conflicting or insufficient data, **When** the plan is created, **Then** the system states the limitation and avoids unsupported claims.

---

### User Story 6 - Compare Against Benchmarks (Priority: P2)

As an owner or agency user, I want privacy-safe benchmark reports so that I can compare performance with relevant peers and identify improvement opportunities.

**Why this priority**: Benchmarks add decision context while requiring strict privacy thresholds.

**Independent Test**: A user opens a benchmark report for an eligible cohort, sees aggregated comparisons and sample sufficiency, and verifies that no peer workspace can be identified.

**Acceptance Scenarios**:

1. **Given** a sufficiently large eligible cohort, **When** benchmark reporting is opened, **Then** the system shows aggregated comparisons, cohort definition, covered period, and sample sufficiency.
2. **Given** an insufficient cohort, **When** a benchmark is requested, **Then** the system withholds the comparison and explains the minimum-data requirement.
3. **Given** a benchmark report, **When** a user reviews it, **Then** no other workspace, client, contact, campaign, or deal is identifiable.

### Edge Cases

- A forecast includes a very large deal that dominates expected revenue.
- Historical data is sparse, stale, imported, duplicated, or missing key stages.
- Attribution signals arrive late, conflict, or cannot connect a touchpoint to a deal.
- A user changes a deal stage or value after a forecast snapshot is generated.
- A churn-risk contact is unsubscribed, has a sensitive-contact restriction, or belongs to a protected segment.
- A growth plan proposes actions that exceed workspace permissions, available credits, or approval boundaries.
- A benchmark cohort becomes too small after filtering by industry, company size, or period.
- Agency users compare clients while client-facing reports must remain isolated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Authorized users MUST be able to review a revenue forecast for a selected workspace and period.
- **FR-002**: Forecasts MUST show expected revenue, an uncertainty range, confidence, covered period, data freshness, and major drivers.
- **FR-003**: Forecast drivers MUST link to supporting deals, stages, activities, and documented assumptions.
- **FR-004**: Forecasts MUST distinguish system estimates from user-adjusted scenarios.
- **FR-005**: The system MUST identify insufficient, stale, sparse, or exceptional data and MUST avoid presenting false precision.
- **FR-006**: Authorized users MUST be able to review marketing attribution insights for supported campaign and revenue touchpoints.
- **FR-007**: Attribution reports MUST show the selected attribution view, contributing touchpoints, covered period, source links, missing-data limitations, and interpretation guidance.
- **FR-008**: Attribution insights MUST distinguish observed contribution patterns from proven causation.
- **FR-009**: The system MUST support comparison across documented attribution views without rewriting source activity.
- **FR-010**: Open deals MUST be eligible for risk analysis with risk level, confidence, contributing factors, recommended next actions, and update time.
- **FR-011**: Deal-risk factors MUST link to supporting workspace activity and MUST be explainable to the user.
- **FR-012**: Users MUST be able to accept, dismiss, override, or provide feedback on deal-risk recommendations.
- **FR-013**: Accepting a recommended deal action MUST create the related task or reviewable draft no more than once.
- **FR-014**: The system MUST identify eligible churn-risk customers with confidence, contributing factors, and recommended supervised retention actions.
- **FR-015**: Retention workflows MUST reuse existing approval, suppression, sending-limit, connected-account, and delivery-recovery controls.
- **FR-016**: Retention outreach MUST NOT target unsubscribed, restricted, or otherwise ineligible contacts.
- **FR-017**: Authorized users MUST be able to request a growth plan for a selected period and business goal.
- **FR-018**: Growth plans MUST contain prioritized actions, supporting evidence, expected outcomes, limitations, and applicable owner or team context.
- **FR-019**: Users MUST be able to accept selected growth-plan actions into tasks, campaign briefs, or reviewable workflows without duplicating prior acceptance.
- **FR-020**: Growth plans MUST NOT execute protected actions without the existing workspace policy and approval controls.
- **FR-021**: Authorized users MUST be able to review privacy-safe benchmark reports for eligible cohorts and selected periods.
- **FR-022**: Benchmark reports MUST show cohort definition, period, aggregation basis, sample sufficiency, comparison metrics, and interpretation guidance.
- **FR-023**: Benchmark reports MUST withhold comparisons when the eligible cohort does not meet the privacy threshold.
- **FR-024**: Benchmark outputs MUST NOT expose identifiable workspace, client, contact, campaign, deal, or user data from peers.
- **FR-025**: Intelligence reports MUST preserve snapshot generation time and MUST clearly identify when source data changed after generation.
- **FR-026**: Dashboards MUST surface forecast changes, risky deals, churn-risk customers, attribution insights, growth-plan actions, and benchmark opportunities with links to details.
- **FR-027**: The system MUST provide clear recovery guidance for missing data, insufficient history, stale snapshots, ineligible cohorts, permission blocks, credit limits, and failed intelligence runs.
- **FR-028**: User feedback and overrides for forecasts, risk predictions, retention signals, attribution interpretations, and growth actions MUST be recorded for quality review.

### Security & Trust Requirements *(mandatory when feature handles workspace data, AI, or external actions)*

- **STR-001**: Intelligence results, source records, scenarios, feedback, and reports MUST remain workspace-scoped and permission-checked.
- **STR-002**: Forecasts, attribution insights, predictions, growth plans, and benchmarks MUST identify uncertainty, limitations, and data freshness clearly.
- **STR-003**: Intelligence recommendations MUST remain advisory until a user accepts them; protected actions MUST continue to require policy validation and human approval.
- **STR-004**: Benchmark reporting MUST use privacy-safe aggregation, minimum cohort thresholds, and controls that prevent peer re-identification.
- **STR-005**: Client-facing and white-label reports MUST exclude internal-only intelligence details unless explicitly approved for client visibility.

### Key Entities *(include if feature involves data)*

- **Forecast Snapshot**: A period-specific revenue estimate with range, confidence, drivers, assumptions, freshness, and generation time.
- **Forecast Scenario**: A distinguishable user-adjusted view of eligible forecast assumptions.
- **Attribution Insight**: A selected interpretation of observed campaign and revenue touchpoints with limitations.
- **Deal Risk Assessment**: A deal-specific risk level, confidence, factors, recommendations, feedback, and update time.
- **Retention Risk Assessment**: A customer-specific churn-risk signal with reasons, confidence, and supervised response options.
- **Growth Plan**: A goal-specific set of prioritized, evidence-backed revenue actions and limitations.
- **Growth Action**: A proposed task, campaign brief, or reviewable workflow that a user may accept or dismiss.
- **Benchmark Cohort**: A privacy-qualified peer group definition and sample sufficiency state.
- **Benchmark Snapshot**: An aggregated period-specific comparison report that cannot expose peer identities.
- **Intelligence Feedback**: A user acceptance, dismissal, override, or quality note tied to an insight.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authorized users can open a forecast, understand its range and confidence, and drill into its top drivers in under 3 minutes.
- **SC-002**: Forecast validation shows that 100% of displayed forecasts identify covered period, generation time, freshness, uncertainty, and supporting drivers.
- **SC-003**: Attribution reports trace 100% of displayed touchpoints to source activity or identify the source as unavailable.
- **SC-004**: At least 80% of pilot sales users can identify an at-risk deal and accept or dismiss a recommended action in under 2 minutes.
- **SC-005**: Retention-workflow acceptance tests show zero outreach to unsubscribed, restricted, or otherwise ineligible contacts.
- **SC-006**: At least 80% of pilot growth plans result in one or more accepted or explicitly dismissed actions.
- **SC-007**: Benchmark privacy tests show zero peer re-identification and withhold 100% of reports that fail the minimum cohort threshold.
- **SC-008**: Intelligence dashboards show updated or explicitly stale status for 100% of displayed forecasts, risk assessments, growth plans, and benchmark snapshots.
- **SC-009**: Zero protected actions execute from intelligence recommendations without existing workspace-policy validation and required human approval.

## Assumptions

- Earlier phases provide reliable CRM, deal, campaign, delivery, automation, agent-run, approval, and performance history.
- Forecasts and predictions support decisions but do not promise outcomes.
- Attribution presents contribution insights and limitations rather than claiming perfect causal certainty.
- Benchmark reporting is opt-in where required and only appears when privacy thresholds are satisfied.
- Existing suppression, approval, connected-account, workspace-policy, and credit controls remain authoritative for retention and growth-plan execution.
- Client-facing reporting uses an approved subset of intelligence metrics and respects Phase 4 isolation boundaries.

## Scope Boundaries *(mandatory)*

### Included

- Revenue forecasts with ranges, confidence, drivers, scenarios, and freshness
- Evidence-backed attribution insights with documented interpretation boundaries
- Explainable deal-risk predictions and recommended next actions
- Churn-risk detection and supervised customer-retention workflows
- AI-generated growth plans with reviewable actions
- Privacy-safe benchmark reports with minimum cohort thresholds
- Intelligence dashboard summaries, feedback, and quality-review records

### Deferred

- Guaranteed revenue outcomes or fully autonomous strategic decisions
- Unsupervised outreach or protected actions triggered only by predictions
- Peer-identifiable benchmark exports or comparisons below privacy thresholds
- Arbitrary custom predictive-model builders
- Enterprise data-warehouse replacement and unrestricted external business-intelligence tooling
