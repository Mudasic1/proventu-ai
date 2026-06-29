"""
Research tools — web search with Tavily primary / DuckDuckGo fallback.

Set TAVILY_API_KEY in .env for full search quality.
Without it the tool falls back to DuckDuckGo Instant Answers (limited).
"""

import logging

import httpx
from agents import RunContextWrapper, function_tool

from app.agents.context import WorkspaceContext
from app.core.config import get_settings

logger = logging.getLogger(__name__)

_TAVILY_URL = "https://api.tavily.com/search"
_DDG_URL = "https://api.duckduckgo.com/"


async def _tavily_search(query: str, api_key: str, max_results: int = 5) -> str:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            _TAVILY_URL,
            json={"query": query, "max_results": max_results, "search_depth": "basic"},
            headers={"Authorization": f"Bearer {api_key}"},
        )
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results") or []
    if not results:
        return f"No web results found for: {query}"

    lines = [f"Web search results for: '{query}'"]
    for r in results[:max_results]:
        title = r.get("title", "No title")
        url = r.get("url", "")
        snippet = (r.get("content") or r.get("snippet") or "")[:300]
        lines.append(f"\n  [{title}]({url})\n  {snippet}")
    return "\n".join(lines)


async def _duckduckgo_search(query: str) -> str:
    """Fallback: DuckDuckGo Instant Answers API (no key required)."""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            _DDG_URL,
            params={"q": query, "format": "json", "no_redirect": "1", "no_html": "1"},
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()

    abstract = data.get("AbstractText") or ""
    related = data.get("RelatedTopics") or []

    if not abstract and not related:
        return (
            f"Limited search results for '{query}'. "
            "Set TAVILY_API_KEY for full web search capability."
        )

    lines = [f"Search results for: '{query}'"]
    if abstract:
        lines.append(f"\nSummary: {abstract[:500]}")
    for topic in related[:4]:
        if isinstance(topic, dict) and topic.get("Text"):
            lines.append(f"  • {topic['Text'][:200]}")
    return "\n".join(lines)


@function_tool
async def web_search(
    context: RunContextWrapper[WorkspaceContext],
    query: str,
    max_results: int = 5,
) -> str:
    """Search the web for business intelligence, competitor info, or market research.

    Uses Tavily if configured (recommended), otherwise falls back to DuckDuckGo.
    Good for: competitor analysis, industry trends, audience research, pricing.

    Args:
        query: The search query string (be specific for better results).
        max_results: Number of results to return (1–10, default 5).
    """
    settings = get_settings()
    max_results = max(1, min(10, max_results))

    try:
        if settings.tavily_api_key:
            return await _tavily_search(query, settings.tavily_api_key, max_results)
        else:
            return await _duckduckgo_search(query)
    except httpx.TimeoutException:
        return f"Search timed out for '{query}'. Please try a more specific query."
    except Exception as exc:
        logger.warning("web_search failed: %s", exc)
        return f"Web search temporarily unavailable. Error: {type(exc).__name__}"
