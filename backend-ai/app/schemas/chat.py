from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern=r"^(system|user|assistant)$")
    content: str = Field(min_length=1, max_length=32_000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=100)


class ChatResponse(BaseModel):
    message: ChatMessage


class AgentRunRequest(BaseModel):
    task_type: str = Field(min_length=1, max_length=80)
    goal: str = Field(min_length=8, max_length=4_000)
    workspace_context: dict = Field(default_factory=dict)


class AgentRunResponse(BaseModel):
    agent_run_id: str
    agent_name: str
    summary: str
    requires_approval: bool
    risk_level: str
    output: dict
