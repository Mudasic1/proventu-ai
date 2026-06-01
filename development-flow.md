# development-flow.md

> Senior Software Engineer build rules for the Sales & Marketing Agentic SaaS.
>
> This document defines how the AI coding agent must plan, build, test, refactor, and ship code across the monorepo.

---

## 0. Project Structure

```txt
/
├── frontend/   # Next.js app, authentication, dashboard UI, Drizzle ORM, NeonDB auth/business tables
└── backend-ai/ # FastAPI AI backend, OpenAI Agents SDK, SQLModel, NeonDB AI/runtime tables
```

### Folder Responsibilities

| Folder | Owns | Must Not Own |
|---|---|---|
| `/frontend` | UI, auth, user/workspace dashboard, server actions, route protection, client-facing CRM/product flows | AI agent orchestration internals, long-running agent execution logic |
| `/backend-ai` | AI agents, tool execution, agent traces, campaign generation, CRM intelligence, background AI tasks, backend APIs | Frontend session UI, visual app routing, React components |

---

## 1. Core Engineering Principle

The agent must build like a senior engineer:

1. **Understand before coding**
2. **Design the smallest correct solution**
3. **Keep domain boundaries clean**
4. **Write typed, secure, testable code**
5. **Ship in small vertical slices**
6. **Refactor only when it improves clarity or correctness**
7. **Never create fake logic just to make UI look complete**

The goal is not to generate maximum code. The goal is to generate maintainable product value.

---

## 2. Agent Operating Mode

Before making changes, the coding agent must follow this loop:

```txt
Read task
→ Inspect related files
→ Identify current architecture
→ Define implementation plan
→ Build smallest working slice
→ Run checks/tests
→ Refactor safely
→ Summarize changes
```

### Mandatory Before Coding

The agent must inspect:

- Existing folder structure
- Existing naming conventions
- Existing database schema
- Existing API patterns
- Existing validation style
- Existing error handling style
- Existing auth/session handling
- Existing environment variable usage

The agent must not invent a new architecture if one already exists.

---

## 3. Development Phases

## Phase 1: Foundation

### Goal

Prepare the app foundation without overbuilding.

### Build Order

1. Monorepo conventions
2. Environment variable validation
3. Frontend auth/session flow
4. Workspace model
5. User/workspace relationship
6. Protected dashboard shell
7. Backend health API
8. Backend database connection
9. Basic frontend-to-backend API contract
10. Shared error response format

### Done When

- User can sign in
- User can access protected dashboard
- User belongs to a workspace
- Backend health endpoint works
- Frontend can call backend safely
- Environment config fails fast when missing

---

## Phase 2: CRM Core

### Goal

Create the business data layer that AI will use later.

### Build Order

1. Contacts
2. Companies
3. Tags/segments
4. Contact notes
5. Contact activity timeline
6. Basic import/manual create flow
7. Search and filtering
8. Workspace-level isolation

### Rules

- Every CRM record must belong to a workspace.
- Never query workspace data without workspace scoping.
- Never trust client-provided workspace IDs without verifying access.
- All write operations must validate ownership.

### Done When

- User can create, update, search, and delete contacts
- Contacts are isolated by workspace
- Timeline shows meaningful CRM activity
- API errors are clean and predictable

---

## Phase 3: Sales Pipeline

### Goal

Let users track revenue opportunities.

### Build Order

1. Pipeline model
2. Pipeline stages
3. Deals
4. Deal stage movement
5. Deal notes/activity
6. Deal value and expected close date
7. Task/follow-up model
8. Pipeline dashboard metrics

### Rules

- Deal stage changes must create timeline activity.
- Lost deals must capture lost reason.
- Won deals must capture close date.
- Follow-up tasks must support due date, owner, and status.

### Done When

- User can manage deals through stages
- Pipeline dashboard shows real metrics
- Stale deals can be detected
- Follow-up tasks can be created and completed

---

## Phase 4: Marketing Content System

### Goal

Allow users to create and schedule marketing content drafts.

### Build Order

1. Campaign model
2. Content idea model
3. Social post draft model
4. Content calendar
5. Approval status
6. Basic AI draft generation request
7. Human review/edit flow
8. Publish-ready state

### Rules

- AI-generated content starts as a draft.
- Publishing requires explicit human approval.
- Store prompt context, generated output, status, and reviewer.
- Never silently overwrite human-edited content.

### Done When

- User can create campaigns
- User can generate social post drafts
- User can approve/reject/edit drafts
- Calendar displays approved and draft content

---

## Phase 5: Email System

### Goal

Support sales and marketing email workflows safely.

### Build Order

1. Email template model
2. Email draft model
3. Email sequence model
4. Sequence steps
5. Contact personalization fields
6. AI-generated email drafts
7. Approval before sending
8. Reply/outcome tracking placeholder

### Rules

- Cold outreach must require review before sending.
- Unsubscribe handling must be respected.
- Do not send emails automatically until approval rules exist.
- Store email status: draft, approved, scheduled, sent, failed.

### Done When

- User can generate an email sequence
- User can edit and approve emails
- Emails are connected to contacts/campaigns
- System records email activity in CRM timeline

---

## Phase 6: Agentic AI Backend

### Goal

Create supervised AI agents that perform useful business tasks.

### Backend Agent Types

| Agent | Responsibility |
|---|---|
| Supervisor Agent | Routes user goals to the correct specialist agent |
| Strategy Agent | Creates campaign and growth strategy |
| Content Agent | Creates social posts, hooks, captions, scripts |
| Email Agent | Creates email sequences and follow-ups |
| CRM Agent | Summarizes contacts, suggests tags, creates next actions |
| Sales Agent | Reviews pipeline, detects stale deals, drafts follow-ups |
| Analytics Agent | Explains performance and recommends actions |
| Compliance Agent | Checks unsafe, spammy, or risky outputs |

### Agent Execution Rule

Agents must follow this lifecycle:

```txt
Request received
→ Validate user/workspace access
→ Load minimal required context
→ Select agent or handoff path
→ Run agent with tools
→ Apply guardrails
→ Return draft/result
→ Store trace metadata
→ Require approval for risky actions
```

### Agent Output Rules

AI output must be structured whenever possible.

Example:

```json
{
  "summary": "string",
  "recommended_actions": [],
  "drafts": [],
  "requires_approval": true,
  "risk_level": "low | medium | high"
}
```

### Agent Must Not

- Send emails without approval
- Publish social posts without approval
- Delete records without approval
- Modify billing
- Export customer data without approval
- Make unsupported claims in marketing copy
- Access data outside the workspace

---

## 4. Frontend Rules: `/frontend`

## 4.1 Next.js App Rules

- Prefer server-side data access for sensitive data.
- Use protected routes for dashboard pages.
- Keep client components only where interactivity is required.
- Keep server actions small and focused.
- Validate all form inputs before mutations.
- Never expose secrets to the browser.
- Never trust client-side authorization checks alone.

## 4.2 Authentication Rules

Authentication must provide:

- User identity
- Session validation
- Protected dashboard access
- Workspace membership check
- Role/permission check

### Required Auth Guards

```txt
Unauthenticated user → redirect to sign in
Authenticated without workspace → redirect to onboarding
Authenticated with workspace → allow dashboard
Authenticated without permission → show forbidden state
```

## 4.3 Drizzle ORM Rules

- Schema must be explicit and typed.
- Every table that stores user business data needs `workspaceId`.
- Use migrations for schema changes.
- Do not manually edit production database schema.
- Avoid raw SQL unless it is necessary and reviewed.
- Keep query functions small and reusable.

### Recommended Frontend DB Domains

```txt
users
sessions/accounts/auth tables
workspaces
workspace_members
contacts
companies
deals
pipelines
stages
tasks
campaigns
social_posts
email_templates
email_drafts
approvals
```

## 4.4 Frontend File Organization

Recommended pattern:

```txt
frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── onboarding/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── crm/
│   ├── pipeline/
│   ├── campaigns/
│   └── emails/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validations/
│   ├── permissions/
│   ├── api-client/
│   └── utils/
├── server/
│   ├── actions/
│   ├── queries/
│   └── mutations/
└── drizzle/
    ├── schema.ts
    └── migrations/
```

---

## 5. Backend Rules: `/backend-ai`

## 5.1 FastAPI Rules

- Use typed request and response models.
- Keep routes thin.
- Put business logic in services.
- Put agent orchestration in dedicated modules.
- Use dependency injection for DB session, auth context, and workspace context.
- Return consistent error responses.
- Log useful operational events without leaking secrets.

## 5.2 SQLModel Rules

- Keep DB models explicit.
- Separate create/read/update schemas where useful.
- Use migrations for schema changes.
- Avoid mixing route logic with database persistence.
- Ensure workspace-level isolation on every query.

## 5.3 Backend File Organization

Recommended pattern:

```txt
backend-ai/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   └── errors.py
│   ├── db/
│   │   ├── session.py
│   │   ├── models/
│   │   └── migrations/
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/
│   ├── schemas/
│   ├── services/
│   ├── agents/
│   │   ├── supervisor.py
│   │   ├── strategy_agent.py
│   │   ├── content_agent.py
│   │   ├── email_agent.py
│   │   ├── crm_agent.py
│   │   ├── sales_agent.py
│   │   ├── analytics_agent.py
│   │   ├── compliance_agent.py
│   │   ├── tools/
│   │   ├── guardrails/
│   │   └── traces/
│   └── tests/
└── pyproject.toml
```

---

## 6. Database Ownership Rules

Because both frontend and backend use NeonDB, the agent must prevent schema conflicts.

### Rule

Each folder owns its own schema area.

| Domain | Owner |
|---|---|
| Auth/session tables | Frontend |
| User/workspace tables | Frontend primary owner |
| CRM/pipeline/product app tables | Frontend primary owner |
| Agent run tables | Backend |
| Agent trace metadata | Backend |
| AI task queue/result tables | Backend |
| Tool call logs | Backend |
| AI approval metadata | Shared concept, but one source of truth required |

### Shared Entity Rule

If backend needs CRM or workspace data:

- Prefer reading through backend service APIs or read-only DB views.
- Do not duplicate core business tables unless there is a deliberate sync design.
- Do not let SQLModel and Drizzle both migrate the same table.

### Naming Rule

Backend-owned AI tables should use a clear prefix:

```txt
ai_agent_runs
ai_tool_calls
ai_traces
ai_tasks
ai_outputs
ai_guardrail_results
```

---

## 7. API Contract Rules

Frontend-to-backend calls must use stable contracts.

### Standard Success Response

```json
{
  "data": {},
  "meta": {}
}
```

### Standard Error Response

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### API Design Rules

- Validate request body.
- Validate session/auth.
- Validate workspace access.
- Return typed responses.
- Never return stack traces to the frontend.
- Use idempotency keys for expensive AI actions.
- Use pagination for list endpoints.

---

## 8. AI Agent Build Rules

## 8.1 Agent Context Loading

Agents must load only the context required for the task.

Bad:

```txt
Load all contacts, all emails, all campaigns, all deals
```

Good:

```txt
Load workspace profile + selected campaign + related contacts + recent activity only
```

## 8.2 Tool Rules

Agent tools must be small, safe, and auditable.

Each tool needs:

- Clear name
- Clear description
- Typed input
- Typed output
- Permission check
- Workspace scope
- Error handling
- Logging

Example tool categories:

```txt
get_contact_summary
create_follow_up_task
generate_email_draft
get_pipeline_metrics
find_stale_deals
create_social_post_draft
check_marketing_claims
```

## 8.3 Human Approval Rules

The agent must mark these actions as approval-required:

| Action | Approval |
|---|---|
| Send email | Required |
| Publish social post | Required |
| Delete CRM record | Required |
| Export contacts | Required |
| Update deal stage | Optional by workspace setting |
| Create task | Not required |
| Generate draft | Not required |
| Summarize data | Not required |

## 8.4 Traceability Rules

Every agent run should store:

- Workspace ID
- User ID
- Agent name
- Task type
- Input summary
- Output summary
- Tool calls
- Approval status
- Error status
- Created timestamp
- Duration

Do not store raw secrets, API keys, or unnecessary sensitive payloads.

---

## 9. Security Rules

## 9.1 Authentication and Authorization

- Authenticated does not mean authorized.
- Always check workspace membership.
- Always check role permissions.
- Validate ownership before read/write.
- Never rely only on frontend UI hiding.

## 9.2 Secrets

- Never expose backend secrets to frontend.
- Never commit `.env` files.
- Use server-only environment variables for private keys.
- Rotate compromised keys immediately.
- Do not log tokens, cookies, session IDs, or API keys.

## 9.3 Data Isolation

Every query for workspace data must include workspace scope.

Required pattern:

```txt
WHERE workspace_id = current_workspace_id
```

The agent must treat missing workspace filters as a critical bug.

## 9.4 AI Safety

AI-generated output must be treated as untrusted until validated.

- Validate structured output.
- Check risky claims.
- Require approval for external actions.
- Store audit logs.
- Allow user to undo where possible.

---

## 10. Code Quality Standards

## 10.1 General

- Small functions
- Clear names
- Strong types
- No dead code
- No unused files
- No duplicate business logic
- No hidden side effects
- No hardcoded secrets
- No fake placeholder business logic in production paths

## 10.2 Error Handling

Every production operation needs predictable errors.

Examples:

```txt
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
RATE_LIMITED
AI_RUN_FAILED
EXTERNAL_SERVICE_FAILED
```

## 10.3 Validation

Validate at boundaries:

- Form input
- API request body
- Database writes
- Agent tool input
- Agent structured output
- External webhook payloads

## 10.4 Performance

- Avoid N+1 queries.
- Paginate large lists.
- Cache stable workspace settings where safe.
- Do not run expensive AI calls during simple page loads.
- Move long-running AI tasks to async/background execution when needed.

---

## 11. Testing Strategy

## 11.1 Minimum Test Coverage by Area

| Area | Required Tests |
|---|---|
| Auth | sign in, protected route, workspace access |
| CRM | create/update/delete/search contacts |
| Pipeline | stage movement, ownership checks |
| Email drafts | generation, validation, approval status |
| AI agents | structured output, tool permissions, guardrails |
| Backend APIs | success/error contract |
| DB | migration-safe schema checks |

## 11.2 Test Types

```txt
Unit tests
→ Service tests
→ API route tests
→ Integration tests
→ Critical E2E flows
```

## 11.3 Critical E2E Flows

1. User signs up and creates workspace
2. User creates contact
3. User creates deal
4. User generates campaign draft
5. User approves AI draft
6. User creates follow-up task
7. AI detects stale deal and suggests action

---

## 12. Pull Request Rules

Every PR must include:

- What changed
- Why it changed
- Screenshots for UI changes
- API examples for backend changes
- Migration notes for DB changes
- Test results
- Risks/rollback notes

### PR Checklist

```md
## Summary
- 

## Changes
- 

## Testing
- [ ] Typecheck passed
- [ ] Lint passed
- [ ] Unit tests passed
- [ ] Relevant integration tests passed

## Security
- [ ] Workspace authorization checked
- [ ] No secrets exposed
- [ ] Inputs validated
- [ ] Risky AI actions require approval

## Database
- [ ] Migration added if schema changed
- [ ] No shared table ownership conflict
- [ ] Rollback considered
```

---

## 13. Agent Task Template

Use this format when giving the AI coding agent a task.

```md
# Task

Build: <feature name>

## Goal
<business/user goal>

## Scope
- Include:
- Exclude:

## Folder
- frontend / backend / both

## Requirements
- 

## Data Rules
- workspace scoped
- user permission checked
- migration required: yes/no

## AI Rules
- requires approval: yes/no
- store trace: yes/no
- structured output required: yes/no

## Acceptance Criteria
- 

## Tests Required
- 
```

---

## 14. Example Vertical Slice Tasks

## Task 1: Workspace Onboarding

```txt
frontend:
- onboarding form
- create workspace action
- create workspace member
- redirect to dashboard

backend:
- no backend required unless AI onboarding summary is generated
```

## Task 2: AI Campaign Planner

```txt
frontend:
- campaign creation UI
- AI generate button
- approval/edit screen

backend:
- campaign planning endpoint
- strategy agent
- content agent handoff
- compliance check
- store agent run
```

## Task 3: Stale Deal Detection

```txt
frontend:
- stale deals dashboard card
- suggested follow-up action

backend:
- sales agent
- get stale deals tool
- generate follow-up draft tool
- trace storage
```

---

## 15. Definition of Done

A feature is done only when:

- It solves the user goal
- It is workspace-scoped
- It is typed
- It validates inputs
- It handles errors
- It has necessary tests
- It has no obvious security leak
- It does not break existing flows
- It follows current project conventions
- AI actions are traceable and approval-safe

---

## 16. Anti-Patterns to Avoid

The coding agent must avoid:

- Building huge features in one pass
- Creating multiple competing patterns
- Duplicating schema ownership between Drizzle and SQLModel
- Making AI agents directly mutate production data without approval
- Storing unnecessary sensitive AI context
- Putting business logic inside UI components
- Putting database queries directly inside random route handlers
- Adding libraries without clear need
- Creating fake dashboards with hardcoded metrics
- Ignoring tests because “it works visually”

---

## 17. Senior Engineer Final Rule

Build every feature as a vertical slice:

```txt
Database
→ Service/query layer
→ API/server action
→ UI
→ Validation
→ Tests
→ Observability
```

Do not move to advanced automation until the core CRM, pipeline, campaign, and approval flows are reliable.

The SaaS must feel simple to users, but internally it must be secure, observable, and maintainable.
