from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.agents.provider import configure_tracing
from app.core.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    configure_logging()
    configure_tracing()
    yield
    # Shutdown — nothing to clean up (lru_cache singletons are GC'd)


app = FastAPI(
    title="SalesEasy AI Backend",
    version="0.2.0",
    description=(
        "Supervised multi-agent AI service powered by the OpenAI Agents SDK "
        "and Google AI. Agents: Supervisor + Strategy + Content + Email + CRM "
        "+ Sales + Research + Analytics + Compliance. MCP server included."
    ),
    lifespan=lifespan,
)
app.include_router(router)

__all__ = ["app"]
