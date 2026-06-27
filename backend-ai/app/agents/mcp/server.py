"""
SalesEasy AI MCP Server — exposes CRM and analytics tools via Model Context Protocol.

This server can be used by:
  1. External MCP clients (Claude Desktop, Cursor, VS Code Copilot, etc.)
  2. OpenAI Agents SDK via MCPServerStdio transport
  3. Any future agent or integration that speaks MCP

Transport: stdio (default) — run as subprocess, communicates via stdin/stdout.

Usage:
    python -m app.agents.mcp.server

Environment:
    DATABASE_URI      — Neon Postgres connection string (required)
    AI_BACKEND_SHARED_SECRET — Internal auth secret (required for FastAPI)

The MCP server reads its DB config from the same .env as the main service.
"""

import logging
import os
import sys

# Ensure the project root is on the path when run as __main__
_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
))))
if _root not in sys.path:  # noqa: E402
    sys.path.insert(0, _root)

from mcp.server.fastmcp import FastMCP  # noqa: E402

from app.db.session import get_psycopg_connection  # noqa: E402

logger = logging.getLogger(__name__)

mcp = FastMCP(
    name="SalesEasy AI CRM",
    instructions=(
        "This MCP server provides read-only access to a business CRM and analytics database. "
        "Use these tools to fetch contact data, pipeline metrics, and campaign performance. "
        "All data is workspace-scoped — you must always pass workspace_id."
    ),
)


# ── CRM Tools ────────────────────────────────────────────────────────────────

@mcp.tool()
def search_contacts(workspace_id: str, query: str, limit: int = 10) -> str:
    """Search CRM contacts by name, email, or company.

    Args:
        workspace_id: The workspace to scope the search to.
        query: Name, email, or company name fragment to search for.
        limit: Maximum number of results (1–20).
    """
    limit = max(1, min(20, limit))
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, first_name, last_name, email, company_name,
                       status, lead_score
                FROM contact
                WHERE workspace_id = %s
                  AND removed_at IS NULL
                  AND (
                      first_name ILIKE %s OR last_name ILIKE %s
                      OR email ILIKE %s OR company_name ILIKE %s
                  )
                ORDER BY lead_score DESC NULLS LAST
                LIMIT %s
                """,
                (workspace_id, f"%{query}%", f"%{query}%",
                 f"%{query}%", f"%{query}%", limit),
            )
            rows = cur.fetchall()
            if not rows:
                return f"No contacts matching '{query}' in workspace {workspace_id}."

            lines = [f"Contacts matching '{query}':"]
            for r in rows:
                name = f"{r['first_name'] or ''} {r['last_name'] or ''}".strip()
                lines.append(
                    f"  id={r['id']} | {name} | {r['email'] or 'no email'} | "
                    f"{r['company_name'] or ''} | status={r['status']} | score={r['lead_score'] or 0}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("MCP search_contacts failed: %s", exc)
        return f"Contact search unavailable: {type(exc).__name__}"


@mcp.tool()
def get_contact(workspace_id: str, contact_id: str) -> str:
    """Get full details for a CRM contact by ID.

    Args:
        workspace_id: The workspace the contact belongs to.
        contact_id: The contact's UUID.
    """
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT first_name, last_name, email, phone, status, source,
                       company_name, notes, lead_score, created_at, updated_at
                FROM contact
                WHERE id = %s AND workspace_id = %s AND removed_at IS NULL
                """,
                (contact_id, workspace_id),
            )
            row = cur.fetchone()
            if not row:
                return f"Contact {contact_id} not found."

            name = f"{row['first_name'] or ''} {row['last_name'] or ''}".strip() or "Unknown"
            return (
                f"Contact: {name}\n"
                f"  Email: {row['email'] or 'none'} | Phone: {row['phone'] or 'none'}\n"
                f"  Status: {row['status']} | Source: {row['source'] or 'unknown'}\n"
                f"  Company: {row['company_name'] or 'none'}\n"
                f"  Lead score: {row['lead_score'] or 0}\n"
                f"  Notes: {(row['notes'] or '')[:300]}\n"
                f"  Last updated: {row['updated_at']}"
            )
    except Exception as exc:
        logger.warning("MCP get_contact failed: %s", exc)
        return f"Contact lookup unavailable: {type(exc).__name__}"


@mcp.tool()
def get_pipeline_metrics(workspace_id: str) -> str:
    """Get sales pipeline overview: deal counts, total value, stale deals.

    Args:
        workspace_id: The workspace to retrieve pipeline data for.
    """
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE status = 'open')   AS open_deals,
                    COUNT(*) FILTER (WHERE status = 'won')    AS won_deals,
                    COUNT(*) FILTER (WHERE status = 'lost')   AS lost_deals,
                    COALESCE(SUM(value_cents) FILTER (WHERE status = 'open'), 0)
                                                              AS pipeline_value,
                    COUNT(*) FILTER (
                        WHERE status = 'open'
                          AND updated_at < NOW() - INTERVAL '7 days'
                    )                                         AS stale_deals
                FROM deal
                WHERE workspace_id = %s AND removed_at IS NULL
                """,
                (workspace_id,),
            )
            row = cur.fetchone()
            if not row:
                return "No pipeline data available."

            return (
                f"Pipeline metrics for workspace {workspace_id}:\n"
                f"  Open deals: {row['open_deals']}\n"
                f"  Pipeline value: ${row['pipeline_value'] / 100:,.2f}\n"
                f"  Stale deals (7+ days): {row['stale_deals']}\n"
                f"  Won: {row['won_deals']} | Lost: {row['lost_deals']}"
            )
    except Exception as exc:
        logger.warning("MCP get_pipeline_metrics failed: %s", exc)
        return f"Pipeline data unavailable: {type(exc).__name__}"


@mcp.tool()
def list_deals(
    workspace_id: str,
    status: str = "open",
    limit: int = 10,
) -> str:
    """List deals in the pipeline filtered by status.

    Args:
        workspace_id: The workspace to list deals for.
        status: Deal status filter — 'open', 'won', 'lost', or 'all'.
        limit: Maximum results (1–25).
    """
    limit = max(1, min(25, limit))
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            status_filter = "" if status == "all" else "AND d.status = %s"
            params: list = [workspace_id]
            if status != "all":
                params.append(status)
            params.extend([limit])

            cur.execute(
                f"""
                SELECT d.title, d.stage, d.status, d.value_cents,
                       d.updated_at, d.expected_close_date,
                       c.first_name, c.last_name
                FROM deal d
                LEFT JOIN contact c ON c.id = d.contact_id
                WHERE d.workspace_id = %s
                  AND d.removed_at IS NULL
                  {status_filter}
                ORDER BY d.updated_at DESC
                LIMIT %s
                """,
                params,
            )
            rows = cur.fetchall()
            if not rows:
                return f"No {status} deals found."

            lines = [f"{status.title()} deals (top {len(rows)}):"]
            for r in rows:
                contact = f"{r['first_name'] or ''} {r['last_name'] or ''}".strip() or "no contact"
                value = f"${r['value_cents'] / 100:,.2f}" if r["value_cents"] else "no value"
                lines.append(
                    f"  [{r['stage']}] {r['title']} | {contact} | {value} | "
                    f"updated {r['updated_at']}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("MCP list_deals failed: %s", exc)
        return f"Deal list unavailable: {type(exc).__name__}"


@mcp.tool()
def get_campaign_list(workspace_id: str, status: str = "") -> str:
    """List recent campaigns for a workspace.

    Args:
        workspace_id: The workspace to retrieve campaigns for.
        status: Optional filter — 'draft', 'active', 'completed', or '' for all.
    """
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            params: list = [workspace_id]
            status_filter = ""
            if status:
                status_filter = "AND c.status = %s"
                params.append(status)

            cur.execute(
                f"""
                SELECT id, name, objective, status, created_at
                FROM campaign
                WHERE workspace_id = %s AND removed_at IS NULL
                {status_filter}
                ORDER BY created_at DESC
                LIMIT 10
                """,
                params,
            )
            rows = cur.fetchall()
            if not rows:
                return "No campaigns found."

            lines = ["Campaigns:"]
            for r in rows:
                lines.append(
                    f"  id={r['id']} | [{r['status']}] {r['name']} | "
                    f"Objective: {(r['objective'] or 'none')[:80]}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("MCP get_campaign_list failed: %s", exc)
        return f"Campaign list unavailable: {type(exc).__name__}"


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Run as stdio MCP server (default transport)
    mcp.run(transport="stdio")
