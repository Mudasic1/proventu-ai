CREATE TABLE IF NOT EXISTS ai_agent_runs (
  id uuid PRIMARY KEY,
  workspace_id text NOT NULL,
  requested_by_user_id text NOT NULL,
  request_key text,
  campaign_id text,
  agent_name text NOT NULL,
  task_type text NOT NULL,
  status text NOT NULL,
  purpose text NOT NULL,
  input_summary text,
  output_summary text,
  result_json jsonb,
  provider text NOT NULL,
  model text NOT NULL,
  provider_response_id text,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  requires_approval boolean NOT NULL DEFAULT false,
  approval_status text,
  risk_level text,
  error_code text,
  error_message text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT ai_agent_runs_status_check
    CHECK (status IN ('running', 'completed', 'failed')),
  CONSTRAINT ai_agent_runs_approval_check
    CHECK (approval_status IS NULL OR approval_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT ai_agent_runs_risk_check
    CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high'))
);

CREATE INDEX IF NOT EXISTS ai_agent_runs_workspace_idx
  ON ai_agent_runs (workspace_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ai_agent_runs_request_key_idx
  ON ai_agent_runs (request_key)
  WHERE request_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS ai_tool_calls (
  id uuid PRIMARY KEY,
  agent_run_id uuid NOT NULL REFERENCES ai_agent_runs(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  input_json jsonb,
  output_json jsonb,
  success boolean NOT NULL DEFAULT false,
  requires_approval boolean NOT NULL DEFAULT false,
  duration_ms integer,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tool_calls_run_idx
  ON ai_tool_calls (agent_run_id, created_at);
