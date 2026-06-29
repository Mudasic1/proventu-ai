"""
MCP (Model Context Protocol) server for SalesEasy AI.

This server exposes CRM and analytics data as MCP tools so that any
MCP-compatible client (agents, IDE extensions, third-party AI systems)
can access workspace data through the standardised protocol.

Running the server:
    python -m app.agents.mcp.server          # stdio transport (default)

Connecting from an OpenAI Agents SDK agent:
    from agents.mcp import MCPServerStdio
    from app.agents.mcp import get_mcp_server_params

    async with MCPServerStdio(params=get_mcp_server_params()) as server:
        agent = Agent(..., mcp_servers=[server])
"""

import sys


def get_mcp_server_params() -> dict:
    """Return MCPServerStdio params to connect to this MCP server."""
    return {
        "command": sys.executable,
        "args": ["-m", "app.agents.mcp.server"],
    }
