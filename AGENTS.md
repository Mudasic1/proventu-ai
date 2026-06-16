# Proventu AI Development Guidelines

Auto-generated from feature planning. Last updated: 2026-05-31

## Active Technologies

- TypeScript 5 with Node.js 20+ for `frontend/`; Python 3.13+ for `backend-ai/`
- Next.js 16.2.6, React 19.2.4, Better Auth 1.6.12, Drizzle ORM 0.45.2, Neon serverless driver 1.1.0, Zod 4.4.3, Stripe Node SDK; FastAPI, SQLModel, SQLAlchemy, psycopg, Pydantic, pytest, and Ruff for `backend-ai/`
- Neon Postgres with frontend-owned product and financial tables and backend-owned `ai_*` runtime tables

## Project Structure

```text
backend-ai/
frontend/
specs/
```

## Commands

```powershell
cd frontend
npm test
npm run lint
npm run typecheck
```

```powershell
cd backend-ai
pytest
ruff check .
```

## Code Style

- TypeScript: follow existing Next.js server-side authorization and Drizzle patterns.
- Python: keep routes thin, services typed, and worker operations idempotent.
- Preserve one migration owner per table.

## Recent Changes

- `002-subscription-credit-jobs`: Planned Stripe billing, workspace credit wallets, configurable model pricing, and safe background AI jobs.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
