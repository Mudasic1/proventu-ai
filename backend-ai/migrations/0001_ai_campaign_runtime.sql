CREATE TABLE IF NOT EXISTS ai_campaign_run (
  id uuid PRIMARY KEY,
  workspace_id uuid NOT NULL,
  requested_by_user_id text NOT NULL,
  request_key uuid NOT NULL,
  campaign_id uuid NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  status text NOT NULL,
  purpose text NOT NULL,
  provider_response_id text,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  result_json jsonb,
  error_code text,
  safe_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT ai_campaign_run_status_check
    CHECK (status IN ('running', 'completed', 'failed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_campaign_run_workspace_request_idx
  ON ai_campaign_run (workspace_id, request_key);

CREATE INDEX IF NOT EXISTS ai_campaign_run_workspace_created_idx
  ON ai_campaign_run (workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_guardrail_result (
  id uuid PRIMARY KEY,
  ai_run_id uuid NOT NULL REFERENCES ai_campaign_run(id) ON DELETE CASCADE,
  code text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  draft_kind text NOT NULL,
  draft_index integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_guardrail_result_severity_check
    CHECK (severity IN ('low', 'medium', 'high')),
  CONSTRAINT ai_guardrail_result_draft_kind_check
    CHECK (draft_kind IN ('plan', 'social_post', 'email'))
);

CREATE INDEX IF NOT EXISTS ai_guardrail_result_run_idx
  ON ai_guardrail_result (ai_run_id, created_at);
