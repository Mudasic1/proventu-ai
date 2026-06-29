"""
WorkspaceContext — runtime context injected into every agent run.

The OpenAI Agents SDK injects this object via RunContextWrapper[WorkspaceContext]
into every function_tool that declares it as its first parameter.

Each RunContextWrapper gives tools access to the workspace identity, brand
profile, AI policy, and per-run metadata without passing them as LLM arguments
(which would pollute the model's tool schema).
"""

from dataclasses import dataclass, field


@dataclass
class AiPolicy:
    """Workspace-level AI permission boundaries.

    Populated from the workspace's AI settings table. Agents must respect
    these rules; the compliance guardrail enforces them at output time.
    """

    # Actions the owner has explicitly disabled
    prohibited_actions: list[str] = field(default_factory=list)

    # Actions that always need human approval before executing
    always_requires_approval: list[str] = field(
        default_factory=lambda: [
            "send_email",
            "publish_post",
            "reply_to_customer",
            "delete_crm_record",
            "change_billing",
            "export_customer_data",
            "send_cold_outreach",
        ]
    )

    # Maximum number of agent steps before requiring a checkpoint
    max_steps_before_checkpoint: int = 10


@dataclass
class WorkspaceContext:
    """Shared context available to all agents and tools in a single run.

    Passed as the `context` argument to Runner.run() and automatically
    injected into every @function_tool that typehints RunContextWrapper[WorkspaceContext].
    """

    # Identity
    workspace_id: str
    user_id: str

    # Business profile (from onboarding / workspace settings)
    business_name: str = ""
    industry: str = ""
    target_audience: str = ""
    brand_voice: str = ""
    products_services: str = ""
    sales_process: str = ""

    # Current goal / run metadata
    task_type: str = ""          # e.g. "campaign", "pipeline_coach", "qualify_lead"
    campaign_goal: str = ""
    offer_name: str = ""
    offer_description: str = ""

    # AI policy for this workspace
    policy: AiPolicy = field(default_factory=AiPolicy)

    # Accumulated approval requests produced during this run.
    # Tools append to this list when they propose a protected action.
    pending_approvals: list[dict] = field(default_factory=list)

    # Activity log entries produced during this run (for the AI Activity Log UI)
    activity_log: list[dict] = field(default_factory=list)

    def add_pending_approval(
        self,
        action: str,
        description: str,
        content_preview: str = "",
        risk_level: str = "medium",
    ) -> None:
        """Register a protected action that requires human approval."""
        self.pending_approvals.append(
            {
                "action": action,
                "description": description,
                "content_preview": content_preview[:500],
                "risk_level": risk_level,
                "status": "pending",
            }
        )

    def log_activity(self, step: str, detail: str, agent: str = "") -> None:
        """Append a user-visible activity entry."""
        self.activity_log.append(
            {"step": step, "detail": detail, "agent": agent}
        )

    def is_action_prohibited(self, action: str) -> bool:
        return action in self.policy.prohibited_actions

    def requires_approval(self, action: str) -> bool:
        return action in self.policy.always_requires_approval
