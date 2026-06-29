"""
Guardrails package — OpenAI Agents SDK input + output guardrails.

input.py   → scope_guardrail: blocks destructive or out-of-scope requests
output.py  → compliance_guardrail: scans output for spam / unsafe claims
             scan_campaign_plan: regex scan used by the legacy campaign service
"""

from app.agents.guardrails.input import scope_guardrail
from app.agents.guardrails.output import compliance_guardrail, scan_campaign_plan

__all__ = ["scope_guardrail", "compliance_guardrail", "scan_campaign_plan"]
