# Autonomous Multi-Agent AI Architecture

> **System**: SalesEasy AI / Proventu AI
>
> **Architecture**: Hierarchical multi-agent orchestration via OpenAI Agents SDK + MCP
>
> **Primary LLM**: Qwen3.7-Max via Alibaba Cloud Model Studio (OpenAI-compatible endpoint)
>
> **Sub-agent LLM**: Qwen3.5-Flash (low-cost specialist tasks)
>
> **Context length**: 256K+ tokens (Qwen3.7-Max), 128K (Qwen3.5-Flash)

---

## 1. System Overview

### 1.1 What the Autonomous Agent Does

The autonomous multi-agent system operates as a revenue operating system for small businesses. It ingests natural-language goals ("launch an email campaign for my Q2 offer", "schedule a meeting with the Acme Corp lead", "follow up with stale deals in the pipeline") and decomposes them into multi-step workflows executed by specialised agents.

Each agent has bounded responsibility, access to external tools via MCP (Model Context Protocol), and operates under a workspace-scoped AI policy that enforces approval checkpoints before any protected action (send email, publish content, modify CRM data, etc.).

### 1.2 Why MCP

Model Context Protocol provides a standardised interface between LLM agents and external tools/systems. Instead of writing custom tool adapters per model provider, MCP gives us:

- **Unified tool schema** — tools are declared once as MCP servers; any MCP-compatible client (OpenAI Agents SDK, Claude, Cursor, custom agents) can consume them
- **Streamable HTTP transport** — production-grade remote tool access over HTTP with JSON-RPC 2.0
- **Resource primitives** — read-only data access (contacts, pipeline, campaigns) separated from tool execution (create event, send email)
- **Auth layer** — OAuth 2.1 for tool access, built into the MCP spec

The existing codebase already has an MCP server (`backend-ai/app/agents/mcp/server.py`) exposing CRM read tools. This architecture extends that pattern with dedicated MCP servers for Calendar and Gmail operations.

### 1.3 Agent Communication

Agents communicate via two complementary patterns:

**1. Supervisor-as-Tools Pattern** (existing — `supervisor.py`)
The Orchestrator agent calls specialist agents as bounded tools via `agent.as_tool()`. Each specialist runs in its own LLM context, receives the relevant sub-task, and returns structured output. The orchestrator synthesises results into a final response.

```
User Goal
    │
    ▼
Orchestrator (Qwen3.7-Max)
    │
    ├── MCP-tool → Calendar Agent (Qwen3.5-Flash)
    ├── MCP-tool → Email Agent (Qwen3.5-Flash)
    ├── MCP-tool → CRM Agent (Qwen3.5-Flash)
    │
    ▼
Structured Response  +  Approval Queue  +  Activity Log
```

**2. MCP Tool Invocation** (new — this document)
When a specialist needs to perform an external action (create calendar event, send email, read inbox), it invokes MCP tools hosted in dedicated MCP servers. The MCP servers handle authentication, side effects, and error recovery.

### 1.4 24/7 Operation

The system runs continuously via:

1. **Alibaba Cloud ACS Agent Sandbox** — serverless container instances that hibernate when idle and wake in ~1 second. The orchestrator agent process stays resident; sub-agents and MCP servers are spawned on demand.
2. **Background job queue** (planned via existing spec 002 subscription-credit-jobs) — async agent runs are enqueued, processed by workers, and results persisted to the database.
3. **Alibaba Cloud Model Studio API** — Qwen models are accessed via OpenAI-compatible HTTP endpoint, with no self-hosted GPU required.

---

## 2. Agent Architecture

### 2.1 Orchestrator Agent

**Role**: Plans multi-step workflows, routes sub-tasks to specialist agents, synthesises results, manages approval checkpoints.

**Model**: Qwen3.7-Max (Alibaba Cloud Model Studio API)

**Extends existing**: `backend-ai/app/agents/supervisor.py` — the existing Supervisor agent is the foundation. Key enhancements:

- **Dynamic planning** — instead of fixed workflows (campaign → strategy → content → email → compliance), the orchestrator analyses the goal and builds a plan dynamically
- **Checkpoint management** — after `max_steps_before_checkpoint` (configurable, default 10), the orchestrator pauses and presents a summary before continuing
- **Error recovery** — if a specialist returns an error, the orchestrator retries with adjusted context or escalates to the user

```python
# Conceptual structure — extends existing supervisor.py
orchestrator = Agent(
    name="Orchestrator",
    instructions="""You are the Orchestrator Agent.
1. Analyse the user's goal and build a step-by-step plan
2. Route each step to the appropriate specialist via as_tool()
3. Before any protected action, add a pending approval
4. Synthesise specialist outputs into the final response
5. Follow the response structure: Summary, Outputs, Approvals, Risks, Next Actions""",
    model=get_qwen_model("qwen3.7-max"),
    tools=[
        calendar_agent.as_tool(...),
        email_agent.as_tool(...),
        crm_agent.as_tool(...),
        # ... existing specialists
    ],
    input_guardrails=[scope_guardrail],
    output_guardrails=[compliance_guardrail],
)
```

### 2.2 Calendar Agent

**Role**: Manages Google Calendar events — creates meetings, checks availability, reschedules, lists upcoming events.

**Model**: Qwen3.5-Flash (low-cost, high-throughput)

**MCP Server**: `backend-ai/app/agents/mcp/calendar_server.py` (new)

**Tools exposed**:

| Tool | Description | Parameters |
|---|---|---|
| `calendar_create_event` | Create a Google Calendar event with optional Google Meet | title, description, start, end, timezone, attendees[] |
| `calendar_find_slots` | Find available time slots across attendee calendars | date_range, duration_minutes, participant_emails[] |
| `calendar_list_events` | List upcoming events for a user or workspace | time_min, time_max, max_results |
| `calendar_reschedule` | Move an existing event to a new time slot | event_id, new_start, new_end, notify |
| `calendar_get_event` | Get full details for a specific event | event_id |

**Existing code reuse**: The frontend already has `createGoogleCalendarEvent()` in `frontend/src/lib/google/workspace.ts`. The MCP server wraps this same Google Calendar v3 API with workspace-scoped OAuth tokens retrieved via Better Auth's token storage.

```python
@mcp.tool()
async def calendar_create_event(
    workspace_id: str,
    user_id: str,
    title: str,
    description: str,
    start: datetime,
    end: datetime,
    attendee_emails: list[str] | None = None,
) -> str:
    """Create a Google Calendar event. Returns event ID and Meet link."""
    token = await get_google_token(workspace_id, user_id, CALENDAR_SCOPE)
    # ... calls Google Calendar v3 API (same pattern as frontend)
    return json.dumps({"event_id": data["id"], "meet_link": data.get("hangoutLink")})
```

### 2.3 Email Agent

**Role**: Reads Gmail inbox, summarises threads, drafts replies, sends responses, searches emails.

**Model**: Qwen3.5-Flash

**MCP Server**: `backend-ai/app/agents/mcp/gmail_server.py` (new)

**Tools exposed**:

| Tool | Description | Parameters |
|---|---|---|
| `gmail_send_email` | Send an email via Gmail | to, subject, body, cc[], bcc[] |
| `gmail_read_thread` | Read full email thread | thread_id |
| `gmail_search` | Search inbox with Gmail query syntax | query, max_results |
| `gmail_draft_reply` | Create a draft reply in Gmail | thread_id, body |
| `gmail_list_inbox` | List recent inbox messages | max_results, label_ids[] |

**Existing code reuse**: The frontend has `sendGmailMessage()` in `workspace.ts`. The MCP server reuses the same Gmail API v1 approach, with OAuth tokens managed by Better Auth.

**Scopes required**: `https://www.googleapis.com/auth/gmail.send`, `https://www.googleapis.com/auth/gmail.readonly`, `https://www.googleapis.com/auth/gmail.modify` (for drafts)

```python
@mcp.tool()
async def gmail_send_email(
    workspace_id: str,
    user_id: str,
    to: str,
    subject: str,
    body: str,
    cc: list[str] | None = None,
) -> str:
    """Send an email via Gmail. Returns message ID and thread ID."""
    token = await get_google_token(workspace_id, user_id, GMAIL_SEND_SCOPE)
    # ... calls Gmail API v1 (same pattern as frontend)
    return json.dumps({"message_id": data["id"], "thread_id": data["threadId"]})
```

### 2.4 Client Communication Agent

**Role**: Handles multi-turn conversations with clients — follow-ups, notifications, meeting confirmations, deal updates.

**Model**: Qwen3.5-Flash (or Qwen3.5-Plus for complex conversations)

**Capabilities**:

- Reads conversation history from `inbox_conversation` + `inbox_message` tables (existing)
- Composes context-aware replies using CRM data (contact history, deal stage, pipeline position)
- Triggers follow-up sequences based on deal stage transitions
- Coordinates Calendar and Email agents for meeting scheduling flows

**Not a standalone agent** — this is a workflow coordinator that lives in the Orchestrator's toolset. It is invoked when the user's goal involves client interaction.

```python
client_comm_agent = Agent(
    name="ClientCommunication",
    instructions="""You handle client communications:
    - Read conversation history from CRM
    - Compose replies that are on-brand and context-aware
    - Propose follow-up timing based on deal stage
    - Coordinate with Calendar and Email agents when scheduling is needed
    Never send without approval.""",
    model=get_qwen_model("qwen3.5-flash"),
    tools=[...],  # CRM read tools + coordination instructions
)
```

### 2.5 Memory Agent

**Role**: Stores and retrieves cross-session context — past agent runs, user preferences, conversation history, learned patterns.

**Model**: Qwen3-32B-A6B (or Qwen3.5-Flash for simple retrieval)

**Storage**:

| Store | Technology | Content |
|---|---|---|
| Relational | Existing Neon Postgres (`ai_agent_runs`, `ai_tool_calls`, `ai_agent_activity`, `ai_agent_approvals`) | Run metadata, tool call records, activity logs, approvals |
| Vector | pgvector (extension on existing Postgres) | Conversation embeddings for semantic retrieval |
| KV Cache | Redis (optional, for hot-path context) | Recent conversation summaries, active tool sessions |

**Vector schema** (new table: `ai_memory_entries`):

```sql
CREATE TABLE ai_memory_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    agent       TEXT NOT NULL,            -- 'orchestrator', 'calendar', 'email', etc.
    entry_type  TEXT NOT NULL,            -- 'conversation', 'preference', 'fact', 'error'
    content     TEXT NOT NULL,
    embedding   vector(1536),             -- Qwen embedding dimension
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspace(id)
);

CREATE INDEX idx_memory_workspace ON ai_memory_entries(workspace_id);
CREATE INDEX idx_memory_vector ON ai_memory_entries USING ivfflat (embedding vector_cosine_ops);
```

**Memory Agent tools**:

| Tool | Description |
|---|---|
| `memory_store` | Store a fact/preference/conversation with embedding |
| `memory_recall` | Semantic search over past memories |
| `memory_recent` | Retrieve recent context for a workspace/user |
| `memory_forget` | Remove stale or irrelevant entries |

### 2.6 Existing Specialists (preserved)

The 8 existing specialist agents from `backend-ai/app/agents/specialists/` remain operational:

| Specialist | Module | Role |
|---|---|---|
| Strategy | `strategy.py` | Campaign strategy, content calendars, go-to-market plans |
| Content | `content.py` | Social media posts, hooks, captions, carousels |
| Email (drafting) | `email_agent.py` | Email campaigns, sequences, follow-ups, subject lines |
| CRM | `crm_agent.py` | Contact intelligence, lead scoring, next actions |
| Sales | `sales.py` | Pipeline coaching, stale deals, follow-up priorities |
| Research | `research.py` | Web research, competitor analysis, market trends |
| Analytics | `analytics.py` | Performance data, revenue metrics, improvements |
| Compliance | `compliance.py` | Content review, spam risk, regulatory flags |

These agents continue to produce *drafts and recommendations*. The new Calendar and Email agents additionally *execute* approved actions via MCP tools.

---

## 3. MCP Architecture

### 3.1 MCP Server Design

The system uses a **Gateway + Multiple Servers** architecture:

```
                    ┌─────────────────────────┐
                    │   MCP Gateway Server    │
                    │  (port 8100, Streamable │
                    │   HTTP transport)        │
                    └──────────┬──────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  CRM Server  │  │Calendar Server│  │ Gmail Server │
    │  (existing)  │  │    (new)     │  │    (new)     │
    │  stdio / HTTP│  │  HTTP + OAuth│  │  HTTP + OAuth│
    └──────────────┘  └──────────────┘  └──────────────┘
```

**CRM Server** (existing — `server.py`):
- Tools: `search_contacts`, `get_contact`, `get_pipeline_metrics`, `list_deals`, `get_campaign_list`
- Transport: stdio (for local agent) + Streamable HTTP (for remote)
- Auth: workspace-scoped, no user-level OAuth needed (reads own DB)

**Calendar Server** (new — `calendar_server.py`):
- Tools: `calendar_create_event`, `calendar_find_slots`, `calendar_list_events`, `calendar_reschedule`
- Transport: Streamable HTTP
- Auth: OAuth 2.1 via Better Auth token store (user-level Google Calendar scope)

**Gmail Server** (new — `gmail_server.py`):
- Tools: `gmail_send_email`, `gmail_read_thread`, `gmail_search`, `gmail_draft_reply`, `gmail_list_inbox`
- Transport: Streamable HTTP
- Auth: OAuth 2.1 via Better Auth token store (user-level Gmail scope)

### 3.2 MCP Client Integration

The OpenAI Agents SDK connects to MCP servers via `MCPServerStdio` or `MCPServerHttp`:

```python
from agents.mcp import MCPServerHttp

# During agent initialisation
calendar_mcp = MCPServerHttp(
    url="http://localhost:8101/mcp",
    headers={"Authorization": f"Bearer {MCP_API_KEY}"},
)

gmail_mcp = MCPServerHttp(
    url="http://localhost:8102/mcp",
    headers={"Authorization": f"Bearer {MCP_API_KEY}"},
)

crm_mcp = MCPServerStdio(
    params=MCPServerStdioParams(
        command="python",
        args=["-m", "app.agents.mcp.server"],
    ),
)

# Agent with MCP tools
calendar_agent = Agent(
    name="CalendarAgent",
    instructions="You manage Google Calendar events...",
    model=get_qwen_model("qwen3.5-flash"),
    mcp_servers=[calendar_mcp, crm_mcp],  # Calendar agent reads CRM too
)
```

### 3.3 Authentication Flow

```
User connects Google OAuth
        │
        ▼
Better Auth stores tokens (encrypted at rest)
        │
        ▼
Agent run starts with WorkspaceContext (workspace_id, user_id)
        │
        ▼
MCP tool call → Gateway → MCP Server
        │
        ▼
Server retrieves token via get_google_token(workspace_id, user_id, scope)
        │
        ▼
If token valid → call Google API
If token expired → attempt refresh via Better Auth
If refresh fails → return auth error to agent → agent escalates to user
```

**Token refresh handling** — Better Auth's Google OAuth is configured with `accessType: "offline"` and `prompt: "select_account consent"` to ensure refresh tokens. The `get_google_token()` function checks expiry and refreshes automatically.

### 3.4 Permission Handling

MCP tools check permissions at three levels:

1. **Workspace scope** — every tool call includes `workspace_id`; MCP servers filter queries by workspace
2. **User scope** — `user_id` is passed for user-specific operations (calendar events, email)
3. **Action policy** — before any side-effecting tool call, the orchestrator checks `WorkspaceContext.is_action_prohibited()` and `WorkspaceContext.requires_approval()`
4. **OAuth scope** — tools check that the user has granted the required Google API scopes before executing

### 3.5 MCP Tool Schemas (Detailed)

#### Calendar Server Tools

```
Tool: calendar_create_event
  Input:
    workspace_id: string    — workspace scope
    user_id: string         — user whose calendar to use
    title: string           — event title
    description: string     — event description
    start: string           — ISO 8601 datetime
    end: string             — ISO 8601 datetime
    timezone: string        — IANA timezone (default: "UTC")
    attendees: [{
      email: string,
      optional?: boolean
    }]
    conference: boolean     — attach Google Meet (default: true)
  Output:
    event_id: string
    html_link: string
    meet_link: string|null
    created: boolean

Tool: calendar_find_slots
  Input:
    workspace_id: string
    user_id: string
    date_range: { start: string, end: string }
    duration_minutes: number
    participant_emails: string[]
  Output:
    slots: [{
      start: string,
      end: string,
      conflicts: string[]
    }]

Tool: calendar_list_events
  Input:
    workspace_id: string
    user_id: string
    time_min: string         — ISO 8601 (default: now)
    time_max: string         — ISO 8601 (default: +7 days)
    max_results: number      — (default: 20)
  Output:
    events: [{
      id: string,
      title: string,
      start: string,
      end: string,
      attendees: string[],
      meet_link: string|null
    }]
```

#### Gmail Server Tools

```
Tool: gmail_send_email
  Input:
    workspace_id: string
    user_id: string
    to: string
    subject: string
    body: string
    cc: string[]             — optional
    bcc: string[]            — optional
    thread_id: string|null   — to reply within a thread
  Output:
    message_id: string
    thread_id: string
    sent: boolean

Tool: gmail_read_thread
  Input:
    workspace_id: string
    user_id: string
    thread_id: string
  Output:
    thread: {
      id: string,
      messages: [{
        from: string,
        to: string[],
        subject: string,
        body: string,         — plain text extracted
        sent_at: string
      }]
    }

Tool: gmail_search
  Input:
    workspace_id: string
    user_id: string
    query: string            — Gmail search syntax
    max_results: number      — (default: 10)
  Output:
    messages: [{
      id: string,
      thread_id: string,
      from: string,
      subject: string,
      snippet: string,
      sent_at: string
    }]
```

---

## 4. Technology Stack

### 4.1 AI Models

| Role | Model | Provider | Cost (per 1M tokens) | Rationale |
|---|---|---|---|---|
| Orchestrator | Qwen3.7-Max | Alibaba Model Studio | $1.20 in / $6.00 out | Best agentic benchmark scores, 35hr autonomous runs, native function calling |
| Sub-agents (Calendar, Email, CRM, etc.) | Qwen3.5-Flash | Alibaba Model Studio | $0.07 in / $0.26 out | 20× cheaper than orchestrator, sufficient for bounded tasks |
| Memory/Embedding | Qwen3-32B (open) or text-embedding-3-small | Self-hosted / API | Variable | Vector embeddings for semantic search |
| Content creation (creative) | Qwen3.5-Plus | Alibaba Model Studio | $0.40 in / $2.40 out | Higher quality for marketing copy when needed |

**Estimated monthly cost** (1000 agentic cycles/day, 85% routed to Flash):
- Orchestrator: ~$90/month
- Sub-agents: ~$18/month
- **Total API cost: ~$108/month**

### 4.2 Backend

| Component | Technology | Location | Notes |
|---|---|---|---|
| API layer | Python 3.13+ / FastAPI 0.136+ | `backend-ai/` | Existing, well-tested |
| Agent framework | `openai-agents>=0.17.0` | `backend-ai/` | Existing, provider-agnostic |
| MCP SDK | `mcp>=1.28.0` (Python) | `backend-ai/` | Existing, plan migration to v2 after Jul 27 |
| LLM client | `openai>=1.84.0` | `backend-ai/` | Existing, points to OpenAI-compatible endpoint |
| Database access | SQLModel / psycopg 3 | `backend-ai/` | Existing |
| Auth tokens | Better Auth 1.6.12 | `frontend/` | Existing, Google OAuth tokens stored encrypted |

### 4.3 Frontend

| Component | Technology | Notes |
|---|---|---|
| UI framework | Next.js 16.2.6 / React 19.2.4 | Existing |
| MCP client | `@ai-sdk/mcp@2.0.0` | Already in node_modules, not wired yet |
| Google API | Direct HTTP to Google v3 APIs | Existing in `workspace.ts` |
| Auth | Better Auth + Drizzle adapter | Existing |

### 4.4 Database

| Schema | Technology | Tables | Owner |
|---|---|---|---|
| Business data | Neon Postgres (Drizzle ORM) | workspace, contact, deal, campaign, etc. | Frontend |
| Agent runtime | Neon Postgres (SQLModel) | ai_agent_runs, ai_tool_calls, ai_agent_activity, ai_agent_approvals | Backend |
| Agent memory | Neon Postgres + pgvector | ai_memory_entries (new) | Backend |

### 4.5 Infrastructure

| Service | Provider | Purpose | Cost |
|---|---|---|---|
| Model API | Alibaba Cloud Model Studio (Singapore) | Qwen3.7-Max, Qwen3.5-Flash inference | Pay-per-token (~$108/mo) |
| Container runtime | ACS Agent Sandbox | Orchestrator + MCP servers, hibernation support | ~$30-50/mo (idle + peak) |
| Database | Neon Postgres (existing) | Business + agent runtime data | Already paid |
| Cache (optional) | Redis / Valkey | Hot-path context, rate limiting state | ~$10-15/mo |
| Monitoring | OpenTelemetry + Grafana | Trace agent runs, token usage, errors | ~$20-30/mo |

---

## 5. Autonomous Workflow Examples

### 5.1 "Schedule a meeting with the client tomorrow"

```
User: "Schedule a 30-minute meeting with John from Acme Corp tomorrow at 2 PM my time"

Step 1: Orchestrator Agent (Qwen3.7-Max)
  └─ Analyses intent:
     - Action: schedule meeting
     - Entity: John from Acme Corp (contact lookup needed)
     - Time: tomorrow 2PM, 30 min
     - Requires: Calendar + Email coordination

Step 2: CRM MCP Tool → search_contacts("John", "Acme Corp")
  └─ Returns: contact_id, email, timezone

Step 3: Orchestrator → Calendar Agent (via as_tool())
  └─ Calendar Agent invokes calendar_create_event MCP tool:
     - title: "Meeting with John (Acme Corp)"
     - start: tomorrow 14:00 (user's timezone)
     - end: tomorrow 14:30
     - attendees: [john@acme.com]
     - conference: true
  └─ Returns: event_id, meet_link

Step 4: Orchestrator → Email Agent (via as_tool())
  └─ Email Agent invokes gmail_send_email MCP tool:
     - to: john@acme.com
     - subject: "Meeting Confirmation: SalesEasy AI Discussion"
     - body: "Hi John, confirmed for tomorrow at 2PM. Meet link: {meet_link}"

Step 5: Orchestrator synthesises response
  └─ "Meeting created: Tomorrow 2:00-2:30 PM
      Google Meet: {link}
      Confirmation sent to john@acme.com
      Any questions, let me know."
```

### 5.2 "Follow up with stale deals in the pipeline"

```
User: "Draft follow-up emails for deals that haven't been updated in 2 weeks"

Step 1: Orchestrator Agent
  └─ Calls Sales Agent (existing specialist)

Step 2: Sales Agent analyses pipeline via CRM MCP tools
  └─ get_pipeline_metrics(workspace_id) → stale_deals count
  └─ list_deals(workspace_id, status="open") → deal list
  └─ For each stale deal: get_contact(contact_id) → contact details

Step 3: Sales Agent returns prioritised list:
  - Deal A (Acme Corp, $50K, stale 14d) → last contact John
  - Deal B (Beta Inc, $25K, stale 18d) → last contact Sarah
  - Deal C (Gamma LLC, $10K, stale 22d) → last contact Bob

Step 4: Orchestrator → Email Agent
  └─ For each deal, drafts a personalised follow-up email:
     - "Hi {contact}, checking in on {deal_name}..."
     - Stores drafts as pending approvals

Step 5: Orchestrator returns:
  └─ "3 stale deals found. Drafted follow-up emails for each:
      - Deal A (Acme Corp): ready for review
      - Deal B (Beta Inc): ready for review
      - Deal C (Gamma LLC): ready for review
      All drafts require your approval before sending."
```

### 5.3 "Research competitors and prepare a campaign"

```
User: "Research top 3 competitors for my SaaS product and create a LinkedIn campaign"

Step 1: Orchestrator → Research Agent
  └─ Uses web_search tool (existing) to find:
     - Competitor A: pricing, features, positioning
     - Competitor B: market share, recent news
     - Competitor C: weaknesses, customer reviews

Step 2: Orchestrator → Strategy Agent (existing specialist)
  └─ "Using this competitive research, build a differentiation strategy"
  └─ Returns: positioning matrix, key messages, content themes

Step 3: Orchestrator → Content Agent (existing specialist)
  └─ "Create 5 LinkedIn posts based on the differentiation strategy"
  └─ Returns: Post drafts with hooks, CTAs, hashtags

Step 4: Orchestrator calls Compliance Agent (existing specialist)
  └─ Reviews posts for: unsupported claims, competitor disparagement, spam risk

Step 5: Orchestrator returns campaign brief
  └─ Full campaign with research findings, strategy, content drafts, compliance flags
  └─ Posts require approval before scheduling
```

### 5.4 "Check my email and summarise today's important messages"

```
User: "Summarise any urgent emails from today"

Step 1: Orchestrator → Email Agent
  └─ gmail_list_inbox(max_results=20)
  └─ For each unread/important message:
     - gmail_read_thread(thread_id)

Step 2: Email Agent categorises:
  - Urgent: 2 (client follow-up, deal time-sensitive)
  - Important: 5 (campaign update, team requests)
  - Newsletter/CC: remaining

Step 3: Orchestrator returns:
  └─ "Today's Email Summary:
      ⚠ Urgent:
        - John (Acme Corp): "Need proposal by EOD"
        - Sarah (Beta Inc): "Budget approved, ready to sign"
      📌 Important:
        - Campaign report from Analytics
        - Team meeting notes
        - 3 LinkedIn connection requests
      Draft replies ready for review."
```

---

## 6. Production Architecture

### 6.1 Deployment Architecture

```
                         ┌──────────────────────┐
                         │   Alibaba Cloud       │
                         │   Model Studio API    │
                         │  (Qwen3.7-Max, Flash) │
                         └──────────┬───────────┘
                                    │
                         HTTPS (OpenAI-compatible)
                                    │
┌────────────────────────────────────┼────────────────────────────────────┐
│  Alibaba Cloud                      │                                  │
│  ACS Agent Sandbox                  │                                  │
│                                     ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                    Nginx / API Gateway                        │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │      │
│  │  │ /health  │ │ /v1/chat │ │ /v1/agents│ │ /v1/*        │    │      │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                              │                                         │
│          ┌───────────────────┼─────────────────────┐                   │
│          ▼                   ▼                     ▼                   │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────┐         │
│  │  FastAPI     │   │ Agent Runner │   │ Background Workers │         │
│  │  (existing)  │   │  Service     │   │  (RQ / Celery)     │         │
│  │  Routes      │   │              │   │                    │         │
│  └──────┬───────┘   └──────┬───────┘   └─────────┬──────────┘         │
│         │                  │                      │                    │
│         ▼                  ▼                      ▼                    │
│  ┌────────────────────────────────────────────────────────┐           │
│  │              MCP Gateway (port 8100)                    │           │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │           │
│  │  │ CRM MCP │  │Calendar  │  │Gmail MCP │  │Other   │  │           │
│  │  │(stdio)  │  │MCP (HTTP)│  │(HTTP)    │  │MCPs    │  │           │
│  │  └─────────┘  └──────────┘  └──────────┘  └────────┘  │           │
│  └────────────────────────────────────────────────────────┘           │
│                              │                                         │
│                              ▼                                         │
│  ┌────────────────────────────────────────────────────────┐           │
│  │              Neon Postgres                              │           │
│  │  ┌──────────┐ ┌──────────────┐ ┌────────────────────┐  │           │
│  │  │Business  │ │Agent Runtime │ │Agent Memory        │  │           │
│  │  │Tables    │ │Tables        │ │(pgvector)          │  │           │
│  │  └──────────┘ └──────────────┘ └────────────────────┘  │           │
│  └────────────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.2 API Gateway

The existing FastAPI routes at `backend-ai/app/api/routes/` serve as the API gateway. New endpoints for agent operations:

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /v1/agents/run` | Existing | General multi-agent run |
| `POST /v1/agents/calendar/events` | New | Direct calendar MCP proxy |
| `POST /v1/agents/email/send` | New | Direct email MCP proxy (with approval check) |
| `GET /v1/agents/approvals` | Existing | List pending approvals |
| `POST /v1/agents/approvals/{id}/approve` | New | Approve a pending action |
| `POST /v1/agents/approvals/{id}/reject` | New | Reject a pending action |

### 6.3 Queue System

For long-running agent workflows (>30 seconds), the system enqueues work to a background worker:

```
POST /v1/agents/run → FastAPI → Enqueue to Redis → Worker picks up → Executes agent → Stores result
                                                                                        │
                                                                                        ▼
                                                                              Client polls GET /v1/agents/status/{run_id}
```

**Technology**: RQ (RQ) or Celery + Redis (lightweight, Python-native)

**Why queue**:
- Agent runs can take 30-120+ seconds (research + content + email drafting + compliance)
- HTTP timeout limits from API Gateway / load balancer
- Multiple concurrent runs should not block each other
- Failed runs can be retried independently

### 6.4 Background Workers

Worker types:

| Worker | Purpose | Concurrency |
|---|---|---|
| `agent_worker` | Executes agent runs (orchestrator + specialists) | 3-5 per sandbox |
| `scheduler_worker` | Processes scheduled/cron-triggered agent runs | 1-2 per sandbox |
| `webhook_worker` | Processes incoming Gmail push notifications | 1 per sandbox |

### 6.5 Monitoring

Using OpenTelemetry (already planned in the codebase):

| Signal | What | Tool |
|---|---|---|
| Traces | Agent run lifecycle: each tool call, handoff, approval | OpenTelemetry → Jaeger / Grafana Tempo |
| Metrics | Token usage per model, run duration, success/fail rate, approval rate | Prometheus |
| Logs | Agent inputs (truncated), outputs, errors, auth failures | Grafana Loki |
| Alerts | Run failure rate >5%, token cost spike, auth token expiry | Grafana Alerting |

**Key dashboards**:
- **Agent Health**: Run success rate, avg duration, error breakdown by agent
- **Token Economics**: Cost per run, per workspace, per model; projected monthly cost
- **Approval Pipeline**: Pending count, approval time, approval/rejection ratio

### 6.6 Security

| Layer | Control |
|---|---|
| API | `x-ai-backend-secret` header (existing) |
| Agent | `AiPolicy.prohibited_actions` — workspace-configurable |
| Agent | `AiPolicy.always_requires_approval` — protected actions list |
| MCP | Workspace-scoped: all tool calls include `workspace_id` |
| MCP | User-scoped: `user_id` for user-specific operations |
| OAuth | Tokens encrypted at rest via Better Auth |
| OAuth | Auto-refresh with offline access |
| Network | MCP servers listen on internal ports only (not exposed to internet) |
| Audit | Every tool call recorded in `ai_tool_calls` table |
| Input | Existing `scope_guardrail` — blocks out-of-scope requests |
| Output | Existing `compliance_guardrail` — flags risk in generated content |

---

## 7. Implementation Roadmap

### Phase 1: MCP-Calendar and MCP-Gmail Servers

**Duration**: 2-3 weeks

**Status**: Foundation — build the new MCP servers

Actions:

1. **Create calendar MCP server** — `backend-ai/app/agents/mcp/calendar_server.py`
   - Wrap Google Calendar v3 API calls (reuse patterns from `frontend/src/lib/google/workspace.ts`)
   - Implement tools: `calendar_create_event`, `calendar_find_slots`, `calendar_list_events`
   - OAuth token retrieval via Better Auth's encrypted token store
   - Register in `pyproject.toml` entry point

2. **Create Gmail MCP server** — `backend-ai/app/agents/mcp/gmail_server.py`
   - Wrap Gmail API v1 calls
   - Implement tools: `gmail_send_email`, `gmail_read_thread`, `gmail_search`, `gmail_list_inbox`
   - Draft support: `gmail_draft_reply`

3. **Build token service** — `backend-ai/app/services/google_token.py`
   - Unified function to retrieve Google OAuth tokens for a workspace user
   - Automatic refresh on expiry
   - Cache tokens in-memory with TTL

4. **Create MCP Gateway** — `backend-ai/app/agents/mcp/gateway.py`
   - Routes incoming requests to the correct MCP server
   - Single Streamable HTTP endpoint at port 8100
   - Authentication + workspace scope validation

5. **Add `ai_memory_entries` table** — migration in `backend-ai/migrations/`
   - Schema with pgvector extension
   - Indexes for vector search

**Deliverables**:
- `calendar_server.py` with 3 tools
- `gmail_server.py` with 4 tools
- `google_token.py` token service
- `gateway.py` MCP gateway
- DB migration for memory table
- Tests for each MCP tool (unit + integration)
- Manual testing: create calendar event, send email via MCP

### Phase 2: Calendar + Email Specialists

**Duration**: 2-3 weeks

**Status**: Agents — build the agent wrappers around MCP servers

Actions:

1. **Create Calendar Specialist Agent**
   - New agent in `backend-ai/app/agents/specialists/calendar_specialist.py`
   - Connected to calendar MCP server
   - Instructions for: scheduling, availability checking, rescheduling
   - Output format: event details, confirmation status

2. **Create Email Specialist Agent**
   - New agent in `backend-ai/app/agents/specialists/email_specialist.py`
   - Connected to Gmail MCP server
   - Instructions for: composing, sending, reading, summarising
   - Output format: message details, thread summary

3. **Wire into Orchestrator**
   - Add `calendar_agent.as_tool()` and `email_agent.as_tool()` to the Supervisor's tool list
   - Update supervisor instructions with new capabilities
   - Ensure approval checkpoints for email sending

4. **Create Client Communication Specialist**
   - New agent for multi-turn client conversation handling
   - Integrates with existing `inbox_conversation` and `inbox_message` tables
   - Coordinates Calendar + Email for meeting scheduling flows

5. **Update approval queue**
   - Add calendar actions (create_event, reschedule) to `always_requires_approval` list
   - Ensure UI exposes calendar/email approval requests

**Deliverables**:
- `calendar_specialist.py` agent
- `email_specialist.py` agent
- `client_communication.py` agent
- Updated `supervisor.py` with new specialist tools
- Updated `AiPolicy` defaults
- End-to-end tests: "schedule meeting" flow, "send follow-up" flow

### Phase 3: Memory + Autonomous Planning

**Duration**: 3-4 weeks

**Status**: Intelligence — add memory and dynamic planning

Actions:

1. **Build Memory Agent**
   - `backend-ai/app/agents/specialists/memory_specialist.py`
   - Tools: `memory_store`, `memory_recall`, `memory_recent`, `memory_forget`
   - Uses pgvector for semantic search
   - Automatic context injection at run start (recall relevant past runs)

2. **Dynamic planning in Orchestrator**
   - Replace fixed workflow templates with dynamic plan generation
   - Orchestrator analyses goal → builds step list → executes steps → monitors progress
   - Checkpoint after configurable steps

3. **Multi-turn conversation persistence**
   - Store conversation history in `ai_memory_entries` (not localStorage)
   - Retrieve relevant history on each user message
   - Support for: "remember my preference", "what did we discuss about Acme Corp?"

4. **Error recovery and retry logic**
   - MCP tool failures → retry 2x with exponential backoff
   - Agent agent failures → re-route to different specialist
   - Unrecoverable → clear error message + recovery suggestions

5. **Webhook for Gmail push notifications**
   - Google Pub/Sub watcher on Gmail inbox
   - New email → webhook → enqueue analysis → trigger agent if urgent

**Deliverables**:
- `memory_specialist.py` agent + pgvector queries
- Updated orchestrator with dynamic planning
- Conversation persistence working across sessions
- Retry/error recovery tested
- Gmail push notification handler

### Phase 4: Production Deployment

**Duration**: 2-3 weeks

**Status**: Production — harden, deploy, monitor

Actions:

1. **ACS Agent Sandbox deployment**
   - Dockerfile for multi-stage build (existing, may need updates)
   - ACS configuration: min 0.5 vCPU, max 2 vCPU, hibernation enabled
   - Environment variables for Model Studio API key, DB URI, MCP secrets

2. **Background job queue**
   - RQ or Celery integration
   - `agent_worker` with configurable concurrency
   - Job status tracking in DB
   - Client polling for long-running runs

3. **Rate limiting and cost control**
   - Per-workspace token budgets (via existing credit wallet from spec 002)
   - Qwen model tier routing: Flash for simple tasks, Max for complex
   - Token usage tracking per run + per workspace

4. **Monitoring setup**
   - OpenTelemetry instrumentation on agent runner and MCP servers
   - Key metrics: run duration, token count, success rate, approval rate
   - Dashboard for agent health and token economics
   - Alerts for failure spikes and cost anomalies

5. **Security hardening**
   - MCP gateway authentication
   - Audit logging for all tool calls (existing `ai_tool_calls` table)
   - Input/output guardrails updated for new agent types
   - Token refresh monitoring

**Deliverables**:
- Production ACS deployment configuration
- Background job queue operational
- Rate limiting and cost controls active
- Monitoring dashboards + alerts
- Security audit completed
- Load testing: 50 concurrent agent runs

---

## 8. Risks and Improvements

### 8.1 API Limitations

| Risk | Impact | Mitigation |
|---|---|---|
| Qwen3.7-Max rate limits | Orchestrator throttled under high load | Queue system absorbs spikes; sub-agents use Flash tier (higher rate limits) |
| Google API quota (Calendar/Gmail) | Cannot create events or send emails | Workspace-level quota tracking; queue with backoff |
| Model Studio API latency | 2-5s per LLM call → 30-120s per agent run | Streaming responses; background queue for long runs; timeout handling |
| Regional availability | Model Studio Singapore region may have higher latency from non-Asia | Consider multi-region deployment; cache frequently used responses |

### 8.2 Hallucination Control

| Risk | Impact | Mitigation |
|---|---|---|
| Agent invents event details | Wrong meeting time/date in calendar | All tool results returned as structured JSON; orchestrator must use real outputs, not invent |
| Agent invents email content | False claims in client communication | Compliance guardrail (existing) scans all outputs; email sending requires approval |
| Agent hallucinates contact info | Wrong email address used | Contact lookup always uses CRM MCP tool; never "guess" contact details |
| Agent misreads availability | Double-booking | Calendar tool checks availability before creating; idempotent event creation |
| Agent takes wrong action | Schedule conflict | All side-effecting actions require approval checkpoint first |

**General controls**:
- All tool outputs are structured JSON — the model's natural language is never treated as factual
- Temperature 0.2 for analytical agents (Calendar, Email, CRM)
- Temperature 0.6 for creative agents (Content, Strategy)
- Every tool call is logged with input/output for audit
- Human approval required for any action that affects external systems

### 8.3 Security

| Risk | Impact | Mitigation |
|---|---|---|
| Token theft | Unauthorised calendar/email access | Tokens encrypted at rest (Better Auth); short-lived access tokens; refresh tokens rotated |
| Prompt injection | Agent tricked into sending malicious email | Input guardrail scans for injection patterns; output guardrail validates all actions |
| Workspace data leakage | Cross-workspace data exposure | Every tool call scoped to `workspace_id`; MCP servers filter by workspace |
| MCP server unauthorised access | External actors invoke tools | MCP gateway authentication; internal network only; no public exposure |
| OAuth token expiry | Silent failure during agent run | Proactive token refresh; clear error if refresh fails |

### 8.4 Permission Management

| Concern | Approach |
|---|---|
| Who can create calendar events? | User-level Google OAuth scope; workspace policy can restrict |
| Who can send emails? | User-level Google OAuth + workspace approval queue |
| Who can reschedule? | Calendar event owner only (via OAuth) |
| Cross-workspace visibility | Never — all data scoped to `workspace_id` |
| Admin override | Workspace owner can set `AiPolicy` to disable specific actions |

**Approval queue integration** (extends existing pattern):
- Email sending → always requires approval (in `always_requires_approval` list)
- Calendar event creation → configurable (default: approval required for external attendees)
- Calendar event reschedule → approval required if event has external attendees
- Email reading → no approval needed (read-only)

### 8.5 Cost Optimization

| Strategy | Savings | Effort |
|---|---|---|
| Route simple tasks to Qwen3.5-Flash | ~85% cost reduction vs Max | Low — configure per-agent model in provider |
| Context caching (Model Studio feature) | 50% on repeated input context | Low — enabled at API level |
| Batch API calls (50% discount) | 50% on batch-eligible calls | Medium — batch similar agent runs |
| ACS hibernation | 60-80% on idle compute | Low — enabled by default in ACS |
| Semantic cache for common queries | 40-60% on repeated questions | Medium — Redis cache |
| Token budget per workspace | Prevent runaway costs | Low — credit wallet from spec 002 |
| Truncate conversation history | Reduce context window | Low — summarizer agent condenses |

**Tiered routing** (recommended):

```
User Goal
    │
    ▼
Fast Classifier (Qwen3.5-Flash) — ~$0.00007 per classification
    │
    ├── Simple task → Qwen3.5-Flash (sub-agent)
    ├── Complex task → Qwen3.7-Max (orchestrator)
    └── Creative task → Qwen3.5-Plus (content agent)
```

---

## Appendix A: Existing Codebase Integration Points

| Component | File | Status | Role in new architecture |
|---|---|---|---|
| Supervisor agent | `backend-ai/app/agents/supervisor.py` | Existing | Evolves into Orchestrator agent |
| Specialist agents (8) | `backend-ai/app/agents/specialists/*.py` | Existing | Preserved as sub-agent tools |
| MCP server (CRM) | `backend-ai/app/agents/mcp/server.py` | Existing | First MCP server; pattern for new Calendar/Gmail servers |
| Agent runner | `backend-ai/app/services/agent_runner.py` | Existing | Orchestrator execution layer |
| Provider config | `backend-ai/app/agents/provider.py` | Existing | Add Qwen provider alongside Google |
| Context system | `backend-ai/app/agents/context.py` | Existing | WorkspaceContext, AiPolicy — extend with calendar/email policies |
| Guardrails | `backend-ai/app/agents/guardrails/` | Existing | Preserved for all agent types |
| Google Calendar API | `frontend/src/lib/google/workspace.ts` | Existing | Functions to wrap in calendar MCP server |
| Gmail API | `frontend/src/lib/google/workspace.ts` | Existing | Functions to wrap in gmail MCP server |
| Better Auth OAuth | `frontend/src/lib/auth/` | Existing | Token storage and refresh for MCP servers |
| DB: ai_agent_runs | Backend-owned | Existing | Run tracking for all agents |
| DB: ai_tool_calls | Backend-owned | Existing | Per-tool audit records |
| DB: ai_agent_activity | Backend-owned | Existing | Activity log for agent runs |
| DB: ai_agent_approvals | Backend-owned | Existing | Approval queue for protected actions |

## Appendix B: Qwen Model Configuration

```python
# backend-ai/app/agents/provider_qwen.py — new file
"""Qwen model provider via Alibaba Cloud Model Studio."""

from functools import lru_cache
from agents import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

QWEN_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

@lru_cache
def _get_qwen_client() -> AsyncOpenAI:
    from app.core.config import get_settings
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.qwen_api_key,
        base_url=QWEN_BASE_URL,
    )

def get_qwen_model(model: str = "qwen3.7-max", temperature: float = 0.4):
    return OpenAIChatCompletionsModel(
        model=model,
        openai_client=_get_qwen_client(),
    )

def get_qwen_flash(temperature: float = 0.4):
    return get_qwen_model("qwen3.5-flash", temperature)

def get_qwen_plus(temperature: float = 0.6):
    return get_qwen_model("qwen3.5-plus", temperature)
```

**Required env vars** (add to existing config):

```env
# Qwen via Alibaba Cloud Model Studio
QWEN_API_KEY=sk-...
QWEN_ORCHESTRATOR_MODEL=qwen3.7-max
QWEN_SUBAGENT_MODEL=qwen3.5-flash
QWEN_CREATIVE_MODEL=qwen3.5-plus

# For self-hosted fallback (Phase 4+)
QWEN_SELF_HOSTED_URL=http://internal-vllm:8000/v1
```
