# Data Model: Phase 1 Core Revenue Workspace

**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Ownership Rules

- Frontend migrations own all core business tables.
- AI backend migrations own only tables prefixed with `ai_`.
- Every workspace business record includes a workspace relationship.
- Cross-workspace reads and writes are forbidden.

## Core Entities

### Workspace and Context

| Entity | Purpose | Key Relationships |
| --- | --- | --- |
| User | Authenticated product user | Has one or more workspace memberships |
| Workspace | Business account boundary | Has memberships, profile, offers, contacts, pipelines, campaigns |
| Workspace Membership | Grants user access to a workspace | Belongs to one user and one workspace |
| Business Profile | Business context used by product and AI drafts | Belongs to one workspace |
| Offer | Product or service promoted in a campaign | Belongs to one workspace; referenced by campaigns |

### CRM

| Entity | Purpose | Key Relationships |
| --- | --- | --- |
| Contact | Lead or customer record | Belongs to a workspace; optionally related to company, deals, tasks |
| Company | Organization record | Belongs to a workspace; has contacts and deals |
| Contact Import | Summary of an uploaded contact file | Belongs to a workspace; has import rows |
| Contact Import Row | Accepted, rejected, or duplicate import result | Belongs to one contact import |
| Activity Entry | Dated audit and timeline event | Belongs to a workspace; optionally related to contact, deal, campaign, task |

### Sales

| Entity | Purpose | Key Relationships |
| --- | --- | --- |
| Pipeline | Ordered sales process | Belongs to workspace; has ordered stages |
| Pipeline Stage | Named stage in a pipeline | Belongs to pipeline; has deals |
| Deal | Revenue opportunity | Belongs to workspace and stage; optionally related to contact or company |
| Task | Follow-up action | Belongs to workspace; optionally related to contact or deal |

### Marketing and Approval

| Entity | Purpose | Key Relationships |
| --- | --- | --- |
| Campaign | Campaign plan request and generated summary | Belongs to workspace and offer; has drafts |
| Social Draft | Editable generated social content | Belongs to campaign; has approval record |
| Email Draft | Editable generated email content | Belongs to campaign; has approval record |
| Approval | Human review decision | Belongs to workspace; references a reviewable draft |

### AI Runtime

| Entity | Purpose | Key Relationships |
| --- | --- | --- |
| AI Agent Run | Auditable campaign generation execution | Belongs to workspace; references campaign and idempotency key |
| AI Guardrail Result | Risk and claim review result | Belongs to AI agent run; optionally references a draft |

## State Rules

### Contact Import Row

- `accepted`
- `rejected`
- `duplicate`

### Deal

- Active stages use the workspace pipeline order.
- `won` requires a close date.
- `lost` requires a lost reason.

### Task

- `open`
- `completed`
- `cancelled`

### Campaign

- `draft`
- `generating`
- `ready_for_review`
- `generation_failed`

### Draft Approval

- `pending`
- `approved`
- `rejected`

## Default Pipeline

1. New Lead
2. Contacted
3. Qualified
4. Meeting Booked
5. Proposal Sent
6. Negotiation
7. Won
8. Lost

## Index and Query Considerations

- Contacts need workspace-scoped search by name, email, phone, status, source, and tags.
- Duplicate detection needs workspace-scoped normalized contact methods.
- Deals need workspace-scoped lookup by stage, owner, close date, and recent activity.
- Tasks need workspace-scoped lookup by due date, status, priority, contact, and deal.
- Dashboard summaries need efficient workspace-scoped aggregation across contacts, deals, tasks, campaigns, approvals, and activity entries.
- AI agent runs need workspace-scoped lookup by campaign and idempotency key.
