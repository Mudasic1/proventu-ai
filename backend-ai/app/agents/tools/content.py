"""
Content context tools — fetch brand guidelines and past content performance.

These tools give content agents the workspace context they need to match
brand voice and avoid repeating underperforming formats.
"""

import logging

from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext
from app.db.session import get_psycopg_connection

logger = logging.getLogger(__name__)


@function_tool
def get_brand_guidelines(
    context: RunContextWrapper[WorkspaceContext],
) -> str:
    """Retrieve the brand voice, style, and content guidelines for this workspace.

    Returns tone, style, prohibited phrases, preferred formats, and any
    custom brand rules. Always call this before generating social content.
    """
    ctx = context.context

    # Return the inline context first (from workspace profile)
    inline = (
        f"Brand name: {ctx.business_name}\n"
        f"Industry: {ctx.industry}\n"
        f"Target audience: {ctx.target_audience}\n"
        f"Brand voice: {ctx.brand_voice}\n"
        f"Products/services: {ctx.products_services}"
    )

    # Also attempt to load from workspace settings table if available
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT brand_voice, content_pillars, prohibited_phrases
                FROM workspace_settings
                WHERE workspace_id = %s
                """,
                (ctx.workspace_id,),
            )
            row = cur.fetchone()
            if row and any([row["brand_voice"], row["content_pillars"]]):
                db_voice = row["brand_voice"] or ctx.brand_voice
                pillars = row["content_pillars"] or ""
                prohibited = row["prohibited_phrases"] or ""
                return (
                    f"{inline}\n\n"
                    f"Extended brand settings:\n"
                    f"  Voice: {db_voice}\n"
                    f"  Content pillars: {pillars[:500]}\n"
                    f"  Prohibited phrases: {prohibited[:300]}"
                )
    except Exception as exc:
        logger.debug("workspace_settings lookup skipped: %s", exc)

    return inline


@function_tool
def get_content_performance(
    context: RunContextWrapper[WorkspaceContext],
    platform: str = "",
) -> str:
    """Get recent social post performance to inform content decisions.

    Returns the top-performing posts and formats for the workspace.
    Pass a platform to filter by (linkedin, instagram, facebook, x).
    """
    workspace_id = context.context.workspace_id
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            params: list = [workspace_id]
            platform_filter = ""
            if platform:
                platform_filter = "AND sp.platform = %s"
                params.append(platform)

            cur.execute(
                f"""
                SELECT sp.platform, sp.content, sp.status,
                       sp.scheduled_at, sp.published_at
                FROM social_post sp
                WHERE sp.workspace_id = %s
                  AND sp.status IN ('published', 'scheduled')
                  {platform_filter}
                ORDER BY sp.published_at DESC NULLS LAST
                LIMIT 5
                """,
                params,
            )
            rows = cur.fetchall()
            if not rows:
                return (
                    "No published social posts found. "
                    "This appears to be a new account — create your first posts!"
                )

            lines = [f"Recent social posts{' on ' + platform if platform else ''}:"]
            for r in rows:
                snippet = (r["content"] or "")[:150]
                lines.append(
                    f"\n  [{r['platform']}] {snippet}...\n"
                    f"  Status: {r['status']}"
                )
            return "\n".join(lines)
    except Exception as exc:
        logger.warning("get_content_performance failed: %s", exc)
        return "Content performance data temporarily unavailable."
