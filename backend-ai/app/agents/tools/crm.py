"""
CRM tools — read-only access to contacts, deals, and pipeline data.

All tools are read-only. Any mutation (create task, move deal stage, etc.)
goes through the draft_task tool or requires an approval via WorkspaceContext.
"""

import logging

from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext
from app.db.session import get_psycopg_connection

logger = logging.getLogger(__name__)


@function_tool
def get_contact_summary(
    context: RunContextWrapper[WorkspaceContext],
    contact_id: str,
) -> str:
    """Get a detailed summary of a CRM contact by their ID.

    Returns name, email, status, lead source, company, notes, and recent
    interaction context. Use this before drafting personalised messages.
    """
    workspace_id = context.context.workspace_id
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
                return f"Contact {contact_id} not found in this workspace."

            name = f"{row['first_name'] or ''} {row['last_name'] or ''}".strip() or "Unknown"
            return (
                f"Contact: {name}\n"
                f"Email: {row['email'] or 'none'}\n"
                f"Phone: {row['phone'] or 'none'}\n"
                f"Status: {row['status'] or 'unknown'}\n"
                f"Lead source: {row['source'] or 'unknown'}\n"
                f"Company: {row['company_name'] or 'none'}\n"
                f"Lead score: {row['lead_score'] or 0}\n"
                f"Notes: {(row['notes'] or '')[:400]}\n"
                f"Created: {row['created_at']}"
            )
    except Exception as exc:
        logger.warning("get_contact_summary failed: %s", exc)
        return "Contact data temporarily unavailable."


@function_tool
def search_contacts(
    context: RunContextWrapper[WorkspaceContext],
    query: str,
    limit: int = 10,
) -> str:
    """Search CRM contacts by name, email, or company name.

    Returns matching contacts with their status and lead score. Use this
    to find who to follow up with or to check existing leads.
    """
    workspace_id = context.context.workspace_id
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
                return f"No contacts matching '{query}'."

            lines = [f"Found {len(rows)} contact(s) matching '{query}':"]
            for r in rows:
                name = f"{r['first_name'] or ''} {r['last_name'] or ''}".strip()
                lines.append(
                    f"  • {name} | {r['email'] or 'no email'} | "
                    f"{r['company_name'] or 'no company'} | "
                    f"Status: {r['status']} | Score: {r['lead_score'] or 0}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("search_contacts failed: %s", exc)
        return "Contact search temporarily unavailable."


@function_tool
def get_pipeline_metrics(
    context: RunContextWrapper[WorkspaceContext],
) -> str:
    """Get the current sales pipeline overview for this workspace.

    Returns total deals, total pipeline value, stale deals count,
    and breakdown by stage. Use this for pipeline coaching and revenue insights.
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            # Overall metrics
            cur.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE status = 'open')          AS open_deals,
                    COUNT(*) FILTER (WHERE status = 'won')           AS won_deals,
                    COUNT(*) FILTER (WHERE status = 'lost')          AS lost_deals,
                    COALESCE(SUM(value_cents) FILTER (WHERE status = 'open'), 0)
                                                                     AS pipeline_value,
                    COUNT(*) FILTER (
                        WHERE status = 'open'
                          AND updated_at < NOW() - INTERVAL '7 days'
                    )                                                AS stale_deals
                FROM deal
                WHERE workspace_id = %s AND removed_at IS NULL
                """,
                (workspace_id,),
            )
            row = cur.fetchone()

            # Stage breakdown
            cur.execute(
                """
                SELECT stage, COUNT(*) AS cnt,
                       COALESCE(SUM(value_cents), 0) AS stage_value
                FROM deal
                WHERE workspace_id = %s AND status = 'open' AND removed_at IS NULL
                GROUP BY stage
                ORDER BY cnt DESC
                """,
                (workspace_id,),
            )
            stages = cur.fetchall()

            if not row:
                return "No pipeline data found."

            lines = [
                "Pipeline overview:",
                f"  Open deals: {row['open_deals']}",
                f"  Pipeline value: ${row['pipeline_value'] / 100:,.2f}",
                f"  Stale deals (7+ days no update): {row['stale_deals']}",
                f"  Won deals: {row['won_deals']}",
                f"  Lost deals: {row['lost_deals']}",
            ]
            if stages:
                lines.append("Stage breakdown:")
                for s in stages:
                    lines.append(
                        f"  • {s['stage']}: {s['cnt']} deals "
                        f"(${s['stage_value'] / 100:,.2f})"
                    )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("get_pipeline_metrics failed: %s", exc)
        return "Pipeline data temporarily unavailable."


@function_tool
def get_deals_needing_attention(
    context: RunContextWrapper[WorkspaceContext],
    limit: int = 10,
) -> str:
    """Get open deals that are stale, high-value, or missing follow-ups.

    Returns deals sorted by priority (high value + longest since update).
    Use this for daily pipeline coaching and prioritisation.
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT d.id, d.title, d.stage, d.value_cents,
                       d.updated_at, d.expected_close_date,
                       c.first_name, c.last_name, c.email
                FROM deal d
                LEFT JOIN contact c ON c.id = d.contact_id
                WHERE d.workspace_id = %s
                  AND d.status = 'open'
                  AND d.removed_at IS NULL
                ORDER BY
                    d.updated_at ASC,
                    d.value_cents DESC NULLS LAST
                LIMIT %s
                """,
                (workspace_id, limit),
            )
            rows = cur.fetchall()
            if not rows:
                return "No open deals found needing attention."

            lines = [f"Top {len(rows)} deals needing attention:"]
            for r in rows:
                contact = (
                    f"{r['first_name'] or ''} {r['last_name'] or ''}".strip()
                    or "Unknown contact"
                )
                value = f"${r['value_cents'] / 100:,.2f}" if r["value_cents"] else "no value set"
                close = str(r["expected_close_date"]) if r["expected_close_date"] else "no close date"
                lines.append(
                    f"  • [{r['stage']}] {r['title']} | {contact} | "
                    f"{value} | Close: {close} | Last updated: {r['updated_at']}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("get_deals_needing_attention failed: %s", exc)
        return "Deal data temporarily unavailable."
