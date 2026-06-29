"""
Vercel serverless entrypoint for SalesEasy AI Backend.

Vercel's Python runtime auto-detects FastAPI when it finds `app` in a
recognized entrypoint file (api/index.py, app.py, main.py, etc.).

Usage:
  vercel dev          — local development
  vercel deploy       — production deployment

The app is imported from app.api and re-exported here. Vercel wraps it
with its own ASGI handler — no Mangum or uvicorn needed.
"""

import os
import sys

# Ensure the project root is on sys.path so that `from app.api import app` works.
# Vercel normally does this automatically, but we include a fallback for safety.
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

from app.api import app

# Vercel expects an `app` variable — it is already imported above.
__all__ = ["app"]
