# HTTP API Contract: Phase 1 Core Revenue Workspace

**Spec**: [../spec.md](../spec.md)  
**Plan**: [../plan.md](../plan.md)

## Response Envelopes

### Success

```json
{
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## AI Backend Endpoints

### `GET /health`

Returns service readiness without exposing secrets.

### `POST /v1/campaign-plans`

Creates or returns an idempotent supervised campaign-planning result.

Required request context:

- Authenticated user identity
- Authorized workspace identity
- Idempotency key
- Campaign goal
- Target audience
- Selected offer
- Minimal business profile context

Required response data:

- Campaign summary
- Recommended angle
- Social post drafts
- Email drafts
- Suggested follow-up tasks
- Risk flags
- Approval-required status
- AI run reference

### Error Codes

- `AUTH_REQUIRED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `AI_RUN_FAILED`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

## Frontend Server Actions

Frontend server actions should provide stable typed operations for:

- Workspace onboarding and profile updates
- Contact create, update, removal, search, filtering, note creation, and import
- Deal create, update, stage movement, won/lost closure, and timeline reads
- Task create, update, completion, and priority reads
- Campaign create, generation request, draft edit, draft approval, and draft rejection
- Dashboard summary and priority queries

Every action resolves workspace authorization from the signed-in user context before reading or changing workspace records.
