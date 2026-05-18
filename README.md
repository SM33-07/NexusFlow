# Nexus Goal Canvas

Demo-ready Atomberg-style goal planning app with Supabase Auth, persisted canvas goals, approval workflow, quarterly scoring, CSV export, manager check-ins, bonus integrations, escalations, and analytics.

## Hackathon Deliverables

- Architecture diagram: `docs/nexus-architecture.svg`
- BRD compliance matrix: `docs/brd-compliance.md`
- Demo credentials: listed below
- Backend schema and seed files: `supabase/schema.sql`, `supabase/seed.sql`
- Bonus modules: Entra readiness, email/Teams notification logs, escalation rules, QoQ analytics

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If Supabase env vars are not configured, the app still runs with demo fallback data. For the final deployed demo, configure Supabase so refresh/persistence and auth are real.

## Supabase Setup

1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. Go to Authentication -> Users and create these users with password `Nexus@12345`:
   - `employee@nexus.demo`
   - `manager@nexus.demo`
   - `admin@nexus.demo`
4. Copy each auth user UUID.
5. In `supabase/seed.sql`, replace:
   - `EMPLOYEE_AUTH_UUID`
   - `MANAGER_AUTH_UUID`
   - `ADMIN_AUTH_UUID`
6. Run the edited `supabase/seed.sql` in SQL Editor.
7. Add env vars from `.env.example` to `.env.local` and to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional `OPENAI_API_KEY`

## Auth And Routing

Login lives at `/login`. The app uses Supabase email/password Auth through `/api/auth/login`, stores secure route cookies, and loads the signed-in profile through `/api/me`.

Protected routing is handled in `middleware.ts`:
 - `/manager` allows `manager` and `admin`
 - `/admin` allows `admin`
 - employees are redirected away from manager/admin routes

## Demo Flow

1. Login as `employee@nexus.demo`.
2. Open Goal Canvas, use Auto-Generate SMART Goal, inject a node, log actuals with status, and submit when total weightage is 100%.
3. Logout, login as `manager@nexus.demo`.
4. Open Manager Hub, review submitted goals, edit target/weightage inline, Approve or Return, then log a check-in.
5. Logout, login as `admin@nexus.demo`.
6. Open `/admin` to show cycle windows, check-in completion, audit trail, shared KPI push, and unlock handling.
7. Use Admin bonus sections to show Microsoft Entra sync preview, Teams/email event logs, escalation evaluation, QoQ analytics, completion heatmap, distribution, and manager effectiveness.

## Backend Surface

 - `GET/POST/PATCH/DELETE /api/goals`
 - `POST /api/goals/submit`
 - `POST /api/quarterly-updates`
 - `POST /api/ai/generate-goals`
 - `GET /api/manager/team`
 - `POST /api/manager/check-ins`
 - `GET /api/admin/overview`
 - `POST /api/admin/shared-goals`
 - `POST /api/admin/integrations/sync`
 - `POST /api/admin/escalations/evaluate`
 - `GET /api/export/goals`
 - `POST /api/auth/login`
 - `POST /api/auth/logout`
 - `GET /api/me`

## Deploy

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add the env vars above.
4. Deploy.
5. In Supabase Authentication settings, add your Vercel URL to allowed redirect/site URLs if you later switch to Supabase-hosted auth redirects. This implementation uses direct password login, so no OAuth callback route is required.

## Optional Bonus Integration Env Vars

These are not required for the demo because the app logs notification/integration activity locally, but they make the future-prospect story concrete:

```bash
MICROSOFT_ENTRA_TENANT_ID=
MICROSOFT_ENTRA_CLIENT_ID=
MICROSOFT_ENTRA_CLIENT_SECRET=
TEAMS_WEBHOOK_URL=
SMTP_HOST=
RESEND_API_KEY=
```
