# Docker

This repository runs as two containers:

- `frontend`: Next.js standalone production server on port `3000`
- `backend-ai`: FastAPI AI orchestration service on port `8000`

## Setup

Copy the Docker env example to the Compose env file and fill in real values:

```powershell
Copy-Item .env.docker.example .env
```

Required values:

- `DATABASE_URI`: pooled Neon Postgres connection string
- `BETTER_AUTH_SECRET`: at least 32 random characters
- `AI_BACKEND_SHARED_SECRET`: at least 32 random characters
- `GOOGLE_API_KEY`: Google Gemini API key for `backend-ai`

## Run

```powershell
docker compose up --build
```

Open the app at `http://localhost:3000`.

The frontend calls `backend-ai` through the internal Compose URL
`http://backend-ai:8000`. The backend health endpoint is also published at
`http://localhost:8000/health`.

## Database

Compose does not run migrations automatically. Apply the frontend Drizzle
migrations and `backend-ai/migrations/0001_ai_campaign_runtime.sql` to the same
Neon database before using AI campaign planning.
