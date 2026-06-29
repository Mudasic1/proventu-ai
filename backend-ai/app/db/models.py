from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import JSON, DateTime, Field, Integer, SQLModel, String, Text


class AiAgentRun(SQLModel, table=True):
    __tablename__ = "ai_agent_runs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    workspace_id: str = Field(sa_type=String, nullable=False, index=True)
    requested_by_user_id: str = Field(sa_type=String, nullable=False)
    request_key: str | None = Field(default=None, sa_type=String, unique=True)
    campaign_id: str | None = Field(default=None, sa_type=String)
    agent_name: str = Field(sa_type=String, nullable=False)
    task_type: str = Field(sa_type=String, nullable=False)
    status: str = Field(sa_type=String, nullable=False)
    purpose: str = Field(sa_type=String, nullable=False)
    input_summary: str | None = Field(default=None, sa_type=Text)
    output_summary: str | None = Field(default=None, sa_type=Text)
    result_json: dict | None = Field(default=None, sa_type=JSON)
    provider: str = Field(sa_type=String, nullable=False)
    model: str = Field(sa_type=String, nullable=False)
    provider_response_id: str | None = Field(default=None, sa_type=String)
    input_tokens: int = Field(default=0, sa_type=Integer)
    output_tokens: int = Field(default=0, sa_type=Integer)
    requires_approval: bool = Field(default=False)
    approval_status: str | None = Field(default=None, sa_type=String)
    risk_level: str | None = Field(default=None, sa_type=String)
    error_code: str | None = Field(default=None, sa_type=String)
    error_message: str | None = Field(default=None, sa_type=String)
    duration_ms: int | None = Field(default=None, sa_type=Integer)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )
    completed_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))


class AiToolCall(SQLModel, table=True):
    __tablename__ = "ai_tool_calls"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    agent_run_id: UUID = Field(foreign_key="ai_agent_runs.id", nullable=False, index=True)
    tool_name: str = Field(sa_type=String, nullable=False)
    input_json: dict | None = Field(default=None, sa_type=JSON)
    output_json: dict | None = Field(default=None, sa_type=JSON)
    success: bool = Field(default=False)
    requires_approval: bool = Field(default=False)
    duration_ms: int | None = Field(default=None, sa_type=Integer)
    error_message: str | None = Field(default=None, sa_type=String)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )
