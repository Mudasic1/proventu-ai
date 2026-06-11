from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_uri: str = Field(alias="DATABASE_URI")
    ai_backend_shared_secret: str = Field(
        min_length=32,
        alias="AI_BACKEND_SHARED_SECRET",
    )
    google_api_key: str = Field(min_length=1, alias="GOOGLE_API_KEY")
    google_model: str = Field(min_length=1, alias="GOOGLE_MODEL")


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
