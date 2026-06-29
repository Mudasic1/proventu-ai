"""
Google AI provider wired into the OpenAI Agents SDK.

Google exposes an OpenAI-compatible Chat Completions endpoint at:
  https://generativelanguage.googleapis.com/v1beta/openai/

We point the SDK's AsyncOpenAI client at that URL with the Google API key,
then wrap it in OpenAIChatCompletionsModel so every Agent can use it.

Usage:
    from app.agents.provider import get_model, configure_tracing

    configure_tracing()          # call once at startup
    model = get_model()          # returns a reusable model instance
"""

from functools import lru_cache

from agents import OpenAIChatCompletionsModel, set_tracing_disabled
from agents.model_settings import ModelSettings
from openai import AsyncOpenAI

from app.core.config import Settings, get_settings

# Google AI OpenAI-compatible base URL
GOOGLE_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"


def configure_tracing(settings: Settings | None = None) -> None:
    """Disable OpenAI tracing when running against Google AI.

    OpenAI tracing requires an OpenAI API key. When using Google AI
    we disable it to avoid noise. Set DISABLE_TRACING=false in .env
    and provide OPENAI_API_KEY if you want SDK tracing.
    """
    s = settings or get_settings()
    if s.disable_tracing:
        set_tracing_disabled(True)


@lru_cache
def _get_async_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.google_api_key,
        base_url=GOOGLE_OPENAI_BASE_URL,
    )


def get_model(
    temperature: float = 0.4,
    settings: Settings | None = None,
) -> OpenAIChatCompletionsModel:
    """Return an OpenAIChatCompletionsModel backed by Google AI.

    Args:
        temperature: Sampling temperature. Use lower values (0.1–0.3) for
            structured/analytical tasks, higher (0.5–0.7) for creative content.
        settings: Override settings; defaults to get_settings().
    """
    s = settings or get_settings()
    return OpenAIChatCompletionsModel(
        model=s.google_model,
        openai_client=_get_async_client(),
    )


def get_creative_model(settings: Settings | None = None) -> OpenAIChatCompletionsModel:
    """Higher-temperature model for content creation agents."""
    return get_model(temperature=0.6, settings=settings)


def get_analytical_model(settings: Settings | None = None) -> OpenAIChatCompletionsModel:
    """Lower-temperature model for CRM, analytics, compliance agents."""
    return get_model(temperature=0.2, settings=settings)


# Default shared ModelSettings presets
CREATIVE_SETTINGS = ModelSettings(temperature=0.6)
ANALYTICAL_SETTINGS = ModelSettings(temperature=0.2)
BALANCED_SETTINGS = ModelSettings(temperature=0.4)
