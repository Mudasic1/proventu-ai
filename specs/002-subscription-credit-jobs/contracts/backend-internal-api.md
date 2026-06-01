# Backend Internal API Contract

**Owner**: `backend-ai/` for enqueue, cancellation, and runtime execution; `frontend/` for financial finalization  
**Purpose**: Keep AI runtime execution separate from frontend-owned financial state

## Authentication

Internal requests use a server-only HMAC signature:

```text
X-Service-Timestamp: unix_seconds
X-Service-Signature: hex_hmac_sha256(timestamp + "." + raw_body)
```

Rules:

- Reject missing, invalid, or stale signatures.
- Use constant-time comparison.
- Rotate the shared secret through server-only configuration.
- Never expose signatures or service secrets to browsers or logs.

## Standard Envelopes

Success:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Safe internal error summary.",
    "details": {}
  }
}
```

## Frontend to Backend

### `POST /internal/v1/jobs/enqueue`

Creates or returns one backend runtime row.

Request:

```json
{
  "jobRequestId": "frontend_job_request_id",
  "workspaceId": "workspace_id",
  "jobType": "campaign_draft",
  "provider": "configured_provider",
  "model": "configured_model",
  "inputReference": {
    "kind": "frontend_job_request",
    "id": "frontend_job_request_id"
  },
  "maxAttempts": 3
}
```

Response:

```json
{
  "data": {
    "jobRunId": "backend_job_run_id",
    "jobRequestId": "frontend_job_request_id",
    "status": "queued"
  },
  "meta": {
    "idempotentReplay": false
  }
}
```

Rules:

- `jobRequestId` is unique.
- Replays return the existing runtime row.
- The backend loads the minimum required job input from a signed frontend internal read endpoint or a bounded stored reference.
- Do not accept calculated credits or wallet instructions.

### `POST /internal/v1/jobs/{jobRequestId}/cancel`

Requests cooperative cancellation.

Request:

```json
{
  "requestKey": "frontend_cancellation_key"
}
```

Response:

```json
{
  "data": {
    "jobRequestId": "frontend_job_request_id",
    "status": "cancellation_requested"
  },
  "meta": {}
}
```

Rules:

- Repeated cancellation is idempotent.
- Cancellation does not directly change wallet balances.
- Terminal cancellation is reported through finalization callback.

## Backend to Frontend

### `POST /api/internal/ai-jobs/{jobRequestId}/finalize`

Applies exactly one terminal financial outcome.

Completed request:

```json
{
  "finalizationKey": "job_run_id:completed:attempt_number",
  "jobRunId": "backend_job_run_id",
  "outcome": "completed",
  "provider": "configured_provider",
  "model": "configured_model",
  "inputTokens": 1850,
  "outputTokens": 920,
  "providerRequestId": "optional_provider_trace_id",
  "safeResultSummary": "Campaign draft generated"
}
```

Failed request:

```json
{
  "finalizationKey": "job_run_id:failed:attempt_number",
  "jobRunId": "backend_job_run_id",
  "outcome": "failed",
  "safeErrorCode": "PROVIDER_REQUEST_FAILED",
  "safeErrorMessage": "The AI provider could not complete the request."
}
```

Cancelled request:

```json
{
  "finalizationKey": "job_run_id:cancelled:attempt_number",
  "jobRunId": "backend_job_run_id",
  "outcome": "cancelled",
  "safeErrorCode": "JOB_CANCELLED",
  "safeErrorMessage": "The AI job was cancelled."
}
```

Response:

```json
{
  "data": {
    "jobRequestId": "frontend_job_request_id",
    "status": "completed",
    "reservedCredits": 120,
    "finalCredits": 84,
    "releasedCredits": 36,
    "shortfallCredits": 0
  },
  "meta": {
    "idempotentReplay": false
  }
}
```

Rules:

- The frontend recomputes credits from the stored pricing snapshot.
- The backend does not send a trusted calculated charge.
- Repeated `finalizationKey` callbacks return the stored final state.
- Conflicting terminal callbacks after a final state are rejected and audited.
- Callback delivery retries until acknowledged or dead-lettered for operator review.

## Worker Claim Contract

The backend worker claims rows internally using a transaction equivalent to:

```sql
SELECT id
FROM ai_job_run
WHERE status IN ('queued', 'retry_pending')
  AND available_at <= now()
ORDER BY available_at, created_at, id
FOR UPDATE SKIP LOCKED
LIMIT :batch_size;
```

Within the same transaction:

1. Insert or refresh the active lease.
2. Set runtime status to `running`.
3. Increment attempt count.
4. Commit before external provider execution.

The worker heartbeats the lease for long jobs and treats expired leases as recoverable according to retry policy.
