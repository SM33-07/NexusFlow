# Nexus Goal Canvas

Demo-ready Atomberg-style goal planning app with database-backed auth, persisted canvas goals, approval workflow, quarterly scoring, CSV export, manager check-ins, bonus integrations, escalations, and analytics.

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
3. Run `supabase/seed.sql` in SQL Editor.
4. Add env vars from `.env.example` to `.env.local` and to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - optional `OPENAI_API_KEY`

Demo users are seeded automatically:
 - `employee@nexus.demo` / `Nexus@12345`
 - `manager@nexus.demo` / `Nexus@12345`
 - `admin@nexus.demo` / `Nexus@12345`

## Auth And Routing

Login lives at `/login`. The app verifies PBKDF2 password hashes from the `profiles` table through `/api/auth/login`, stores a signed HTTP-only session cookie, and loads the signed-in profile through `/api/me`. Supabase is used as the database through server-only REST calls with `SUPABASE_SERVICE_ROLE_KEY`; the service role key is never sent to the browser.

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
5. Set the Vercel project root to `Nexus` if importing the outer repository folder.
6. No Supabase Auth redirect configuration is required because this build uses direct database-backed login and signed route cookies.

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
