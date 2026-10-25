# Supabase Integration Documentation for AICTE SAKSHAM

This document outlines the architecture, client design, security practices, and manual setup steps for the Supabase integration in AICTE SAKSHAM.

---

## 1. Architecture & Client Strategy

The project uses Next.js App Router (Next.js 16) with `@supabase/ssr` to ensure secure, cookie-based session management across the application boundary:

| Layer | File Path | Usage & Lifecycle |
|---|---|---|
| **Environment Helper** | [`lib/supabase/env.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/lib/supabase/env.ts) | Reads and validates `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Throws clear development errors if missing. |
| **Browser Client** | [`lib/supabase/client.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/lib/supabase/client.ts) | Instantiates `createBrowserClient` for React Client Components. |
| **Server Client** | [`lib/supabase/server.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/lib/supabase/server.ts) | Instantiates `createServerClient` reading and setting auth tokens via Next.js `cookies()` (awaited in Next.js 15+ / 16). |
| **Session Middleware** | [`lib/supabase/middleware.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/lib/supabase/middleware.ts) & [`middleware.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/middleware.ts) | Refreshes auth tokens on incoming requests and writes updated session cookies into the response. |
| **Health Check Endpoint** | [`app/api/health/supabase/route.ts`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/app/api/health/supabase/route.ts) | Safe server-side endpoint verifying connection to the Supabase Auth/API service. |

---

## 2. Security Guardrails

1. **No Service-Role Key in Client Code**: Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are exposed.
2. **Row Level Security (RLS) Maintained**: The health check uses `supabase.auth.getSession()` which safely interrogates authentication readiness without requiring table reads or disabling RLS.
3. **Cookie Integrity**: Authentication tokens are stored in HTTP-only, secure cookies handled by the SSR package rather than `localStorage`.

---

## 3. Environment Variables

The application expects the following variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

An example template is maintained at [`.env.example`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/.env.example).

---

## 4. Remaining Manual Steps for the Team

1. **Retrieve Supabase Credentials**:
   - Go to your project on the [Supabase Dashboard](https://supabase.com/dashboard).
   - Navigate to **Project Settings** &rarr; **API Keys**.
   - Copy the **Project URL** and the **Publishable / Anon key**.
2. **Update Environment Secrets**:
   - Update `aicte-saksham/.env.local` with the real URL and publishable key.
3. **Database Schema & Migrations**:
   - Apply the initial timestamped migration `supabase/migrations/20261025164500_initial_schema.sql` using the Supabase CLI or SQL Editor (see Section 5 below).
   - Confirm in the Supabase Dashboard Table Editor that all 15 tables and RLS policies are active.
4. **Deploying**:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured in your deployment platform (e.g. Vercel / Docker environment).

---

## 5. Applying the Database Migration

The initial secure database migration is saved at:
[`supabase/migrations/20261025164500_initial_schema.sql`](file:///c:/Users/mutha/OneDrive/Desktop/AICTE/aicte-saksham/supabase/migrations/20261025164500_initial_schema.sql)

### Tables Included:
1. `regions`
2. `institutions`
3. `profiles` (linked to `auth.users`)
4. `workflow_definitions`
5. `deadline_policies`
6. `applications`
7. `workflow_tasks`
8. `application_events` (immutable, append-only)
9. `evc_visits` (Expert Visiting Committee)
10. `undertakings` (digital signatures, append-only)
11. `documents` (object storage keys, SHA-256 checksums, metadata)
12. `compliance_submissions`
13. `escalations`
14. `notification_events` (notification dispatch audit)
15. `audit_logs` (immutable audit ledger with automated trigger capture)

### Method A: Via Supabase CLI (Recommended)
1. Link your remote Supabase project:
   ```bash
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   ```
2. Push migrations to remote:
   ```bash
   npx supabase db push
   ```

### Method B: Via Supabase Dashboard SQL Editor
1. Open [Supabase Dashboard](https://supabase.com/dashboard) &rarr; Select Project &rarr; **SQL Editor**.
2. Open or paste the contents of:
   `aicte-saksham/supabase/migrations/20261025164500_initial_schema.sql`
3. Click **Run**.
4. Verify all tables in **Database** &rarr; **Tables** and confirm Row Level Security (RLS) is marked **Enabled** for every table.

