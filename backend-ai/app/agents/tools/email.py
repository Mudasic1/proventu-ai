"""Email context tools — sequence stats to inform email agent decisions."""

import logging

from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext
from app.db.session import get_psycopg_connection

logger = logging.getLogger(__name__)


@function_tool
def get_email_sequence_stats(
    context: RunContextWrapper[WorkspaceContext],
) -> str:
    """Get email sequence and campaign statistics for this workspace.

    Returns active sequences, recent campaign open/click rates, and
    sequence enrollment counts. Use to recommend email strategy.
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            # Email campaigns summary
            cur.execute(
                """
                SELECT name, subject, status, send_count,
                       open_count, click_count, created_at
                FROM email_campaign
                WHERE workspace_id = %s AND removed_at IS NULL
                ORDER BY created_at DESC
                LIMIT 5
                """,
                (workspace_id,),
            )
            campaigns = cur.fetchall()

            # Active sequences
            cur.execute(
                """
                SELECT name, sequence_type, status, step_count
                FROM email_sequence
                WHERE workspace_id = %s AND removed_at IS NULL
                  AND status = 'active'
                LIMIT 5
                """,
                (workspace_id,),
            )
            sequences = cur.fetchall()

            if not campaigns and not sequences:
                return "No email campaigns or sequences found. Start your first campaign!"

            lines = ["Email performance summary:"]
            if campaigns:
                lines.append("\nRecent email campaigns:")
                for c in campaigns:
                    open_rate = (
                        f"{c['open_count'] / c['send_count'] * 100:.1f}%"
                        if c.get("send_count") and c["send_count"] > 0
                        else "N/A"
                    )
                    click_rate = (
                        f"{c['click_count'] / c['send_count'] * 100:.1f}%"
                        if c.get("send_count") and c["send_count"] > 0
                        else "N/A"
                    )
                    lines.append(
                        f"  • {c['name']} | {c['status']} | "
                        f"Sent: {c.get('send_count', 0)} | "
                        f"Open: {open_rate} | Click: {click_rate}"
                    )

            if sequences:
                lines.append("\nActive email sequences:")
                for s in sequences:
                    lines.append(
                        f"  • {s['name']} ({s.get('sequence_type', 'general')}) "
                        f"— {s.get('step_count', '?')} steps"
                    )

            return "\n".join(lines)
    except Exception as exc:
        logger.warning("get_email_sequence_stats failed: %s", exc)
        return "Email stats temporarily unavailable."
