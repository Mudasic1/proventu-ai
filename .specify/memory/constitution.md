<!--
Sync Impact Report
- Version change: template placeholders -> 1.0.0
- Ratification: Initial project constitution adopted on 2026-05-30.
- Added principles:
  - I. Workspace Isolation Is Mandatory
  - II. Human Control Governs AI Actions
  - III. One Owner per Domain, Stable Contracts Between Domains
  - IV. Ship Small Vertical Slices Backed by Real Data
  - V. Validation, Testing, and Observability Are Delivery Requirements
- Added sections:
  - Architecture and Security Constraints
  - Development Workflow and Quality Gates
- Removed sections: None. Template placeholders were replaced.
- Templates synchronized:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Runtime guidance synchronized:
  - ✅ development-flow.md
  - ✅ .specify/scripts/bash/update-agent-context.sh
- Existing feature artifacts synchronized:
  - ✅ specs/001-phase1-revenue-workspace/plan.md
- Command templates:
  - ✅ .specify/templates/commands/ does not exist; no command files required updates.
- Deferred items: None.
-->
# Proventu AI Constitution

## Core Principles

### I. Workspace Isolation Is Mandatory
Every business record, query, mutation, dashboard summary, AI request, and audit entry MUST be
scoped to an authorized workspace. Authentication alone is insufficient: the system MUST verify
workspace membership and required permissions before reading or changing data. Client-provided
workspace identifiers MUST NOT be trusted without server-side authorization. Missing workspace
scope is a release-blocking security defect.

**Rationale**: Proventu AI stores sensitive lead, customer, campaign, and revenue information.
Cross-workspace access would violate the product's core trust boundary.

### II. Human Control Governs AI Actions
AI output MUST be treated as untrusted until validated. Generated content MUST start as an
editable draft. Sending emails, publishing posts, replying to customers, deleting CRM records,
exporting customer data, and other external or destructive actions MUST require explicit human
approval. AI workflows MUST record the requesting user, workspace, purpose, result, risk status,
approval status, and errors without storing secrets or unnecessary sensitive payloads.

**Rationale**: The product differentiates through supervised AI execution. User control is a
product requirement, not an optional safeguard.

### III. One Owner per Domain, Stable Contracts Between Domains
The `frontend/` application MUST own authentication, workspace membership, user-facing product
records, and their migrations. The `backend-ai/` service MUST own AI orchestration, guardrails,
traces, and backend-owned `ai_*` runtime records. Two subsystems MUST NOT migrate or duplicate the
same business table. Cross-boundary calls MUST use typed, documented contracts with predictable
success and error envelopes.

**Rationale**: Explicit ownership prevents schema conflicts, duplicated business logic, and
unreviewable coupling while allowing the web application and AI service to evolve safely.

### IV. Ship Small Vertical Slices Backed by Real Data
Features MUST be delivered as the smallest complete user-valued slice: data model, service or
query layer, boundary validation, API or server action, user interface, tests, and observability
where applicable. User-facing dashboards and workflows MUST use real persisted data. Production
paths MUST NOT contain fake business logic, hardcoded success states, or placeholder metrics.
Later-roadmap complexity MUST remain out of scope until core CRM, pipeline, campaign draft, and
approval flows are reliable.

**Rationale**: A narrow working slice exposes integration and security problems early and creates
demonstrable value without accumulating speculative architecture.

### V. Validation, Testing, and Observability Are Delivery Requirements
All external and trust-boundary inputs MUST be validated, including forms, server actions, API
requests, database writes, agent tools, structured AI outputs, and webhooks. Changes MUST include
tests proportional to their risk: unit tests for rules, integration tests for workspace-scoped
data and contracts, and critical end-to-end tests for primary revenue flows. Production operations
MUST return predictable errors and emit useful logs or audit entries without leaking secrets.

**Rationale**: Secure, observable failures are part of the user experience. Untested workspace
access, AI approval, or schema ownership behavior is not ready to ship.

## Architecture and Security Constraints

- The repository MUST preserve the `frontend/` and `backend-ai/` ownership boundary.
- Frontend-sensitive access MUST run server-side. Browser-only authorization checks are
  insufficient.
- Every business table MUST include a workspace relationship unless the table is intentionally
  global and documented as such.
- Database changes MUST use reviewed migrations. Production schema MUST NOT be edited manually.
- List operations MUST use pagination when growth can make unbounded reads expensive.
- Expensive AI actions MUST use idempotency protection and MUST NOT run during ordinary page loads.
- Secrets, tokens, cookies, session identifiers, and private keys MUST NOT be exposed to the
  browser, committed to source control, or written to logs.
- External actions and destructive mutations MUST define approval, audit, and recovery behavior
  in the feature specification.
- New dependencies and abstractions MUST solve a concrete requirement and fit existing repository
  patterns.

## Development Workflow and Quality Gates

Every change MUST follow this sequence:

1. Inspect the existing architecture, naming conventions, schemas, contracts, validation patterns,
   error handling, authentication, and environment configuration relevant to the task.
2. Define a bounded vertical slice with explicit inclusions and exclusions.
3. Document workspace scope, domain ownership, AI approval behavior, and sensitive-data handling.
4. Add or update migrations and typed contracts before dependent implementation.
5. Implement the smallest correct slice using existing patterns.
6. Run relevant type checks, linting, unit tests, integration tests, and critical end-to-end tests.
7. Review logs, audit behavior, rollback considerations, and accidental scope expansion.

Pull requests MUST include:

- What changed and why
- Scope boundaries and deferred work
- Test results
- Workspace-authorization review
- AI approval and audit review when AI behavior changes
- Migration notes and rollback considerations when schema changes
- Screenshots for user-interface changes
- Contract examples for cross-boundary API changes

Any exception to these gates MUST be documented in the implementation plan with the rejected
simpler alternative and an explicit approval record.

## Governance

This constitution supersedes conflicting project practices. `development-flow.md` provides
operational guidance, but it MUST remain consistent with this constitution.

Amendments MUST:

1. State the rule being added, changed, or removed.
2. Explain the reason and migration impact.
3. Update dependent Spec Kit templates and runtime guidance in the same change.
4. Record the amendment in the Sync Impact Report at the top of this file.
5. Increment the version using semantic versioning:
   - **MAJOR** for incompatible governance changes or principle removals and redefinitions.
   - **MINOR** for new principles, new mandatory gates, or materially expanded guidance.
   - **PATCH** for clarifications and non-semantic wording improvements.

Every feature plan MUST complete the Constitution Check before design begins and re-check it after
design. Every pull request review MUST verify relevant constitutional gates. Violations MUST block
delivery unless an approved exception is documented.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
