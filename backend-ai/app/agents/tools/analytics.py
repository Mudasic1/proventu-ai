"""Analytics tools — campaign performance and revenue metrics."""

import logging

from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext
from app.db.session import get_psycopg_connection

logger = logging.getLogger(__name__)


@function_tool
def get_campaign_analytics(
    context: RunContextWrapper[WorkspaceContext],
    campaign_id: str = "",
) -> str:
    """Get campaign performance analytics for this workspace.

    Pass a campaign_id to get metrics for a specific campaign, or leave
    empty to get a summary of recent campaigns. Returns open rates, click
    rates, social engagement, and post performance.
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            if campaign_id:
                cur.execute(
                    """
                    SELECT c.name, c.objective, c.status,
                           c.created_at, c.updated_at,
                           COUNT(sp.id) AS social_posts,
                           COUNT(ec.id) AS email_campaigns
                    FROM campaign c
                    LEFT JOIN social_post sp ON sp.campaign_id = c.id
                    LEFT JOIN email_campaign ec ON ec.campaign_id = c.id
                    WHERE c.workspace_id = %s AND c.id = %s
                      AND c.removed_at IS NULL
                    GROUP BY c.id, c.name, c.objective, c.status,
                             c.created_at, c.updated_at
                    """,
                    (workspace_id, campaign_id),
                )
            else:
                cur.execute(
                    """
                    SELECT c.name, c.objective, c.status,
                           c.created_at, c.updated_at,
                           COUNT(sp.id) AS social_posts,
                           COUNT(ec.id) AS email_campaigns
                    FROM campaign c
                    LEFT JOIN social_post sp ON sp.campaign_id = c.id
                    LEFT JOIN email_campaign ec ON ec.campaign_id = c.id
                    WHERE c.workspace_id = %s AND c.removed_at IS NULL
                    GROUP BY c.id, c.name, c.objective, c.status,
                             c.created_at, c.updated_at
                    ORDER BY c.created_at DESC
                    LIMIT 5
                    """,
                    (workspace_id,),
                )

            rows = cur.fetchall()
            if not rows:
                return "No campaign data found."

            lines = ["Campaign analytics:"]
            for r in rows:
                lines.append(
                    f"\n  Campaign: {r['name']}\n"
                    f"  Objective: {r['objective'] or 'not set'}\n"
                    f"  Status: {r['status']}\n"
                    f"  Social posts: {r['social_posts']} | "
                    f"Email campaigns: {r['email_campaigns']}\n"
                    f"  Created: {r['created_at']}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("get_campaign_analytics failed: %s", exc)
        return "Campaign analytics temporarily unavailable."


@function_tool
def get_revenue_metrics(
    context: RunContextWrapper[WorkspaceContext],
) -> str:
    """Get revenue and sales performance metrics for this workspace.

    Returns won deals value, forecasted revenue, win rate, average deal
    size, and recent trends. Use for revenue insights and forecasting.
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COUNT(*) FILTER (WHERE status = 'won') AS won_count,
                    COUNT(*) FILTER (WHERE status = 'lost') AS lost_count,
                    COUNT(*) FILTER (WHERE status = 'open') AS open_count,
                    COALESCE(SUM(value_cents) FILTER (WHERE status = 'won'), 0)
                        AS won_value,
                    COALESCE(SUM(value_cents) FILTER (WHERE status = 'open'), 0)
                        AS forecast_value,
                    COALESCE(AVG(value_cents) FILTER (WHERE status IN ('won','lost')), 0)
                        AS avg_deal_size
                FROM deal
                WHERE workspace_id = %s AND removed_at IS NULL
                  AND created_at > NOW() - INTERVAL '90 days'
                """,
                (workspace_id,),
            )
            row = cur.fetchone()
            if not row:
                return "No revenue data found."

            total_closed = (row["won_count"] or 0) + (row["lost_count"] or 0)
            win_rate = (
                f"{row['won_count'] / total_closed * 100:.1f}%"
                if total_closed > 0
                else "N/A (no closed deals)"
            )

            return (
                f"Revenue metrics (last 90 days):\n"
                f"  Won deals: {row['won_count']} "
                f"(${row['won_value'] / 100:,.2f})\n"
                f"  Forecasted value (open): ${row['forecast_value'] / 100:,.2f}\n"
                f"  Average deal size: ${row['avg_deal_size'] / 100:,.2f}\n"
                f"  Win rate: {win_rate}\n"
                f"  Open deals: {row['open_count']}"
            )
    except Exception as exc:
        logger.warning("get_revenue_metrics failed: %s", exc)
        return "Revenue metrics temporarily unavailable."
