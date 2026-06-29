from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_uri: str = Field(alias="DATABASE_URI")

    # Internal service secret (shared with frontend)
    ai_backend_shared_secret: str = Field(min_length=32, alias="AI_BACKEND_SHARED_SECRET")

    # Google AI — accessed via the OpenAI-compatible endpoint
    google_api_key: str = Field(min_length=1, alias="GOOGLE_API_KEY")
    google_model: str = Field(default="gemini-2.0-flash", alias="GOOGLE_MODEL")

    # Optional: Tavily API key for the web_search tool
    # If not set the research agent falls back to DuckDuckGo Instant Answers.
    tavily_api_key: str | None = Field(default=None, alias="TAVILY_API_KEY")

    # Agent runtime limits
    max_agent_turns: int = Field(default=30, alias="MAX_AGENT_TURNS")
    max_agent_steps: int = Field(default=20, alias="MAX_AGENT_STEPS")

    # Disable OpenAI tracing (we use Google AI, not OpenAI)
    disable_tracing: bool = Field(default=True, alias="DISABLE_TRACING")


@lru_cache
def get_settings() -> Settings:
    return Settings()
