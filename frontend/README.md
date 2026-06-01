# SalesEasyAI Frontend

The frontend is a Next.js revenue workspace backed by Neon Postgres, Drizzle ORM, and Better Auth. The current implemented slice intentionally excludes AI agents, generated campaigns, publishing, scheduling, and automatic email sending.

## Included

- Email and password authentication with email verification and password reset hooks
- Revenue workspace onboarding and profile editing
- Workspace-scoped CRM contacts, notes, duplicate warnings, confirmed removal, and CSV import summaries
- Workspace-scoped pipeline deals, explicit stage movement, won/lost closure rules, and follow-up tasks
- Real-data dashboard metrics, priorities, stale deals, and recent activity
- `react-hot-toast` feedback for user-facing mutations

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add the pooled Neon connection string as `DATABASE_URI`.
3. Add a direct Neon connection string as `DATABASE_DIRECT_URI` for migrations.
4. Generate a Better Auth secret with at least 32 random characters.
5. Install dependencies and apply migrations:

```bash
npm install
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

## CSV Contact Import

The contact importer accepts CSV files with these headers:

```text
firstName,lastName,email,phone,company,source,status,tags,notes
```

Rows are classified as accepted, rejected, or duplicate. Duplicate detection uses normalized email addresses and phone numbers inside the active workspace.

## Scope Boundary

The repository specification contains later AI campaign work. That work remains intentionally unimplemented in this frontend slice. No code path sends email, publishes social content, schedules content, or runs autonomous actions.
