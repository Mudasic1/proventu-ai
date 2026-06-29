"""
Tasks tool — creates a task DRAFT only. Never auto-commits without approval.

The draft is registered as a pending approval in WorkspaceContext so the
frontend approval queue can surface it before any record is created.
"""

from typing import Literal

from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext


@function_tool
def draft_task(
    context: RunContextWrapper[WorkspaceContext],
    title: str,
    description: str,
    due_in_days: int,
    priority: Literal["low", "medium", "high"],
    contact_id: str = "",
    deal_id: str = "",
) -> str:
    """Create a follow-up task DRAFT that requires human approval before saving.

    Use this when recommending a task to the user — never create tasks
    automatically without surfacing them for review first.

    Args:
        title: Short task title (e.g. "Follow up with John Doe").
        description: Context about why this task is recommended.
        due_in_days: Days from now when this task is due (0 = today, 1 = tomorrow).
        priority: Task priority level.
        contact_id: Optional CRM contact ID to attach this task to.
        deal_id: Optional deal ID to attach this task to.
    """
    ctx = context.context

    # Enforce: task creation always goes through approval queue
    preview = (
        f"Task: {title}\n"
        f"Description: {description[:200]}\n"
        f"Due in: {due_in_days} day(s)\n"
        f"Priority: {priority}"
    )

    ctx.add_pending_approval(
        action="create_task",
        description=f"Create follow-up task: {title}",
        content_preview=preview,
        risk_level="low",
    )
    ctx.log_activity(
        step="task_drafted",
        detail=f"Drafted task: '{title}' (due in {due_in_days} days, {priority} priority)",
        agent="task_tool",
    )

    return (
        f"Task draft created and added to approval queue.\n"
        f"Title: {title}\n"
        f"Due in: {due_in_days} day(s)\n"
        f"Priority: {priority}\n"
        f"Note: This task will only be saved after human approval."
    )
