# SalesEasy AI Backend

Supervised multi-agent AI orchestration service built on the
**OpenAI Agents SDK** + **Google AI** (via the OpenAI-compatible endpoint).

## Architecture

```
Supervisor Agent
  ├── StrategyAgent   (campaign strategy, content calendars)
  ├── ContentAgent    (social posts, hooks, captions)
  ├── EmailAgent      (campaigns, sequences, follow-ups)
  ├── CRMAgent        (contact intelligence, lead scoring)
  ├── SalesAgent      (pipeline coaching, deal priorities)
  ├── ResearchAgent   (web search via Tavily / DuckDuckGo)
  ├── AnalyticsAgent  (campaign metrics, revenue insights)
  └── ComplianceAgent (spam risk, unsafe claims, tone review)

Guardrails
  ├── scope_guardrail  (input)  — blocks OOB / injection / destructive requests
  └── compliance_guardrail (output) — regex + LLM scan for risky claims

MCP Server (app/agents/mcp/server.py)
  ├── search_contacts
  ├── get_contact
  ├── get_pipeline_metrics
  ├── list_deals
  └── get_campaign_list

API Routes
  POST /v1/agents/run             — General-purpose supervisor run
  POST /v1/agents/pipeline-coach  — Daily/weekly pipeline coaching
  POST /v1/agents/repurpose       — Content repurposing
  POST /v1/agents/qualify-lead    — Lead qualification
  POST /v1/campaign-plans         — Structured campaign plan (legacy)
  POST /v1/chat                   — Chat interface
  POST /v1/agent/run              — Legacy single-agent run
  GET  /health                    — Health check
```

## Local Setup

```powershell
Copy-Item .env.example .env
# Edit .env: DATABASE_URI, AI_BACKEND_SHARED_SECRET, GOOGLE_API_KEY
uv sync
uv run uvicorn main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URI` | ✅ | Neon Postgres connection string |
| `AI_BACKEND_SHARED_SECRET` | ✅ | 32+ char secret shared with frontend |
| `GOOGLE_API_KEY` | ✅ | Google AI Studio API key |
| `GOOGLE_MODEL` | ✅ | Model name (e.g. `gemini-2.0-flash`) |
| `TAVILY_API_KEY` | ⬜ | Tavily search API key (web_search tool) |
| `MAX_AGENT_TURNS` | ⬜ | Max supervisor turns per run (default: 30) |
| `DISABLE_TRACING` | ⬜ | Disable OpenAI tracing (default: true) |

## MCP Server

The MCP server exposes CRM tools to any MCP-compatible client:

```powershell
# Run as a standalone MCP server (stdio transport)
uv run python -m app.agents.mcp.server
```

Add to Claude Desktop `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "saleseasy-crm": {
      "command": "uv",
      "args": ["run", "python", "-m", "app.agents.mcp.server"],
      "cwd": "path/to/saleseasyai/backend-ai"
    }
  }
}
```

## Migrations

Apply in order:
```powershell
uv run python apply_migration.py migrations/0001_ai_campaign_runtime.sql
uv run python apply_migration.py migrations/0002_ai_agent_runtime.sql
uv run python apply_migration.py migrations/0003_ai_activity_log.sql
```

## Verification

```powershell
uv run pytest
uv run ruff check .
```
