-- Migration 0003: AI Agent Activity Log
-- Adds ai_agent_activity table for the user-visible AI Activity Log feature.
-- Apply after 0002_ai_agent_runtime.sql.
-- Owner: backend-ai (never modified by frontend migrations)

-- ── AI agent activity log ─────────────────────────────────────────────────────
-- Stores the structured activity entries produced during each agent run.
-- Surfaced in the frontend as the "AI Activity Log" (analytics screen).

CREATE TABLE IF NOT EXISTS ai_agent_activity (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL,              -- references ai_agent_runs.id (soft FK)
    workspace_id    TEXT NOT NULL,
    agent           TEXT NOT NULL,              -- e.g. "supervisor", "SalesAgent"
    step            TEXT NOT NULL,              -- e.g. "run_started", "task_drafted"
    detail          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_agent_activity_run_id_idx
    ON ai_agent_activity (run_id);

CREATE INDEX IF NOT EXISTS ai_agent_activity_workspace_idx
    ON ai_agent_activity (workspace_id, created_at DESC);

-- ── Pending approvals ─────────────────────────────────────────────────────────
-- Stores the approval requests produced by tool calls during an agent run.
-- The frontend approval queue reads from this table.

CREATE TABLE IF NOT EXISTS ai_pending_approval (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id          UUID NOT NULL,              -- references ai_agent_runs.id (soft FK)
    workspace_id    TEXT NOT NULL,
    action          TEXT NOT NULL,              -- e.g. "create_task", "send_email"
    description     TEXT NOT NULL,
    content_preview TEXT,
    risk_level      TEXT NOT NULL DEFAULT 'medium',  -- low | medium | high
    status          TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
    reviewed_by     TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ,

    CONSTRAINT ai_pending_approval_risk_level_check
        CHECK (risk_level IN ('low', 'medium', 'high')),
    CONSTRAINT ai_pending_approval_status_check
        CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS ai_pending_approval_workspace_idx
    ON ai_pending_approval (workspace_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_pending_approval_run_id_idx
    ON ai_pending_approval (run_id);

COMMENT ON TABLE ai_agent_activity IS
    'User-visible activity log for each AI agent run. Owned by backend-ai.';

COMMENT ON TABLE ai_pending_approval IS
    'Protected action queue requiring human review before execution. Owned by backend-ai.';
