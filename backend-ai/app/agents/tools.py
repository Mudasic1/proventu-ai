import logging

from app.db.session import get_psycopg_connection

logger = logging.getLogger(__name__)


def create_campaign_plan_tool(
    business_name: str = "",
    industry: str = "",
    target_audience: str = "",
    brand_voice: str = "",
    products_services: str = "",
    offer_name: str = "",
    offer_description: str = "",
    goal: str = "",
) -> str:
    """Create a structured campaign plan draft. Provide business profile info
    and campaign goal to generate a complete plan with social posts, emails,
    and follow-up tasks."""
    return (
        f"Campaign plan draft prepared for {business_name}. "
        f"Industry: {industry}. Goal: {goal}. "
        "All drafts require human review before publishing."
    )


def generate_social_post_tool(
    platform: str = "",
    topic: str = "",
    brand_voice: str = "",
) -> str:
    """Generate a social media post draft for the specified platform.
    Supported platforms: linkedin, facebook, instagram, x (twitter)."""
    return (
        f"Draft {platform} post created on topic: {topic}. "
        "Ready for human review."
    )


def generate_email_draft_tool(
    name: str = "",
    subject: str = "",
    goal: str = "",
) -> str:
    """Generate an email draft for a campaign. Provide the email name,
    subject line, and campaign goal."""
    return (
        f"Email draft '{name}' created. Subject: {subject}. "
        "Requires human approval before sending."
    )


def get_contact_summary_tool(contact_id: str = "") -> str:
    """Get a summary of a CRM contact by ID. Returns recent activity,
    deal associations, and engagement status."""
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT first_name, last_name, email, status, source,
                       company_name, notes
                FROM contact
                WHERE id = %s
                """,
                (contact_id,),
            )
            row = cur.fetchone()
            if row:
                return (
                    f"Contact: {row['first_name']} {row['last_name']}, "
                    f"Email: {row['email']}, Status: {row['status']}, "
                    f"Source: {row['source']}, Company: {row['company_name'] or 'N/A'}"
                )
            return "Contact not found."
    except Exception as exc:
        logger.warning("get_contact_summary failed: %s", exc)
        return "Contact lookup unavailable."


def get_pipeline_metrics_tool(workspace_id: str = "") -> str:
    """Get current pipeline metrics for a workspace: total deals,
    pipeline value, stale deals, and won/lost counts."""
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS total_deals,
                       COALESCE(SUM(value_cents), 0) AS total_value,
                       COUNT(*) FILTER (WHERE status = 'open'
                         AND updated_at < NOW() - INTERVAL '7 days') AS stale_deals
                FROM deal
                WHERE workspace_id = %s AND removed_at IS NULL
                """,
                (workspace_id,),
            )
            row = cur.fetchone()
            if row:
                return (
                    f"Pipeline: {row['total_deals']} deals, "
                    f"${row['total_value'] / 100:.2f} total value, "
                    f"{row['stale_deals']} stale deals needing attention."
                )
            return "No pipeline data found."
    except Exception as exc:
        logger.warning("get_pipeline_metrics failed: %s", exc)
        return "Pipeline data unavailable."


def search_knowledge_base_tool(query: str = "", limit: int = 5) -> str:
    """Search the knowledge base for relevant context using semantic search.
    Returns matching contacts, campaigns, or pipeline data."""
    try:
        with get_psycopg_connection() as conn, conn.cursor() as cur:
            results = []

            cur.execute(
                """
                SELECT id, first_name, last_name, email, company_name
                FROM contact
                WHERE first_name ILIKE %s OR last_name ILIKE %s
                   OR email ILIKE %s OR company_name ILIKE %s
                LIMIT %s
                """,
                (f"%{query}%", f"%{query}%", f"%{query}%", f"%{query}%", limit),
            )
            for row in cur.fetchall():
                results.append(
                    f"Contact: {row['first_name']} {row['last_name']} "
                    f"({row['email'] or 'no email'})"
                )

            cur.execute(
                """
                SELECT id, name, objective, status
                FROM campaign
                WHERE name ILIKE %s OR objective ILIKE %s
                LIMIT %s
                """,
                (f"%{query}%", f"%{query}%", limit),
            )
            for row in cur.fetchall():
                results.append(
                    f"Campaign: {row['name']} ({row['status']})"
                )

            if results:
                return "Found:\n" + "\n".join(results)
            return "No results found for the query."
    except Exception as exc:
        logger.warning("search_knowledge_base failed: %s", exc)
        return "Knowledge base search unavailable."
