### Multiple Supabase Clients (Project A + Project B)

#### Overview

This guide shows how to use two Supabase projects from a single Next.js (App Router) app:

- Project A: primary (e.g., clients)
- Project B: secondary (e.g., sessions)

You’ll set up multiple Supabase clients and safely fetch data from each project.

---

#### When to use this

- You have data split across Supabase projects.
- You want a quick implementation without DB-level links (`postgres_fdw`) or Edge Functions.
- You’re fine managing two client instances.

---

#### Install

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

#### Environment variables (.env.local)

Add both projects’ URLs and keys.

Option 1: Both anon (requires RLS policies in each project)

```
NEXT_PUBLIC_SUPABASE_URL_A=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_A=...   # anon/publishable key

NEXT_PUBLIC_SUPABASE_URL_B=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_B=...   # anon/publishable key
```

Option 2: Project B via service role (server-only)

```
NEXT_PUBLIC_SUPABASE_URL_A=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_A=...

NEXT_PUBLIC_SUPABASE_URL_B=...
SUPABASE_SERVICE_ROLE_KEY_B=...              # DO NOT expose to client
```

Notes

- The “publishable key” is the anon key. Never expose service role to the browser.
- If using service role for Project B, only instantiate on the server (Route Handlers/Server Actions).

---

#### Project structure

Recommended minimal files:

- `lib/supabase/client-a.ts`
- `lib/supabase/server-a.ts`
- `lib/supabase/client-b.ts` (only if B uses anon; otherwise omit)
- `lib/supabase/server-b.ts`
- `middleware.ts` (already present; keep focused on Project A auth refresh)
- Optional server proxy for B:
  - `app/api/sessions/route.ts` (or a dedicated route under `app/api/`)

---

#### Clients for Project A (primary, with cookies/session)

Client Component client (browser) – Project A:

```ts
// lib/supabase/client-a.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClientA() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_A!
  );
}
```

Server Component / Actions / Route Handlers – Project A:

```ts
// lib/supabase/server-a.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClientA() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_A!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore writes from Server Components; middleware will refresh
          }
        },
      },
    }
  );
}
```

Middleware (Project A) – keep your existing `middleware.ts` that refreshes A’s session. You don’t need to refresh B here unless you also authenticate users with Project B.

---

#### Clients for Project B (secondary)

Option 1: Project B anon (RLS-protected by B’s own policies)

Client Component client (browser) – B (only if safe to expose):

```ts
// lib/supabase/client-b.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClientB() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_B!
  );
}
```

Server-side – B with anon:

```ts
// lib/supabase/server-b.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClientB() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_B!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore writes from Server Components
          }
        },
      },
    }
  );
}
```

Option 2: Project B via service role (server-only)

```ts
// lib/supabase/server-b.ts
import { createClient } from "@supabase/supabase-js";

export function createServiceClientB() {
  // Service role: no cookies, no browser usage
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_B!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

Security note

- With service role, RLS is bypassed. Use only in server code and return least data via your API.

---

#### Example usage

1. Load clients from Project A in a Server Component

```ts
// app/(dashboard)/dashboard/clients/page.tsx
import { createServerClientA } from "@/lib/supabase/server-a";

export default async function ClientsPage() {
  const supabaseA = await createServerClientA();

  const { data: clients, error } = await supabaseA
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // handle error
  }

  return <pre>{JSON.stringify(clients, null, 2)}</pre>;
}
```

2. Fetch sessions from Project B via a server-only proxy (recommended)

```ts
// app/api/sessions/route.ts
import { NextResponse } from "next/server";
// Choose the correct factory:
// - anon: import { createServerClientB } from '@/lib/supabase/server-b';
// - service: import { createServiceClientB } from '@/lib/supabase/server-b';
import { createServiceClientB } from "@/lib/supabase/server-b";

export async function GET() {
  const supabaseB = createServiceClientB(); // or await createServerClientB()

  const { data, error } = await supabaseB
    .from("sessions")
    .select("*")
    .order("start_time", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
```

3. Consume from UI

```ts
// any Client or Server Component
const res = await fetch("/api/sessions", { cache: "no-store" });
const { sessions } = await res.json();
```

---

#### Schema reference (from connected MCP project)

Sessions (public.sessions)

- id: uuid (pk)
- user_id: uuid (owner)
- start_time: timestamptz (default now())
- end_time: timestamptz nullable
- status: text (scheduled | in_progress | recording | processing | completed | abandoned)
- session_type: text (default 'therapy')
- scheduled_for: timestamptz nullable
- recording_url: text nullable
- summary: text nullable
- insights, strategies, post_session_reflection: text nullable
- transcription: text nullable
- transcription_data: jsonb nullable
- source: text (recorded | uploaded)
- original_filename: text nullable, file_type: text nullable, file_size: bigint nullable
- last_completed_step: varchar nullable, last_saved_at: timestamptz nullable
- progress_percentage: int (0-100)
- abandoned: boolean (default false)
- created_at, updated_at: timestamptz

Note

- In the connected project, clients are your users. Use `public.profiles` (preferred) joined to `auth.users` when needed. The `profiles.id` references `auth.users.id`.

Profiles (public.profiles)
- id: uuid (pk, references `auth.users.id`)
- name: text nullable
- avatar: text nullable (URL)
- age: integer nullable (13–120)
- gender_identity: text nullable (one of: 'female','male','non-binary','prefer-not','other')
- custom_gender: text nullable
- onboarding_completed: boolean default false
- onboarding_completed_at: timestamptz nullable
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

---

#### Queries for UI wiring

Clients dropdown (Project B: profiles as clients)

```ts
// Preferred: use profiles.name if available; fallback to email via auth.users (RPC or server join)
// Simple approach (profiles only):
const { data: clients } = await supabaseB
  .from("profiles")
  .select("id, name")
  .order("name", { ascending: true });

// If you need email fallback (server-only; do not expose service role):
// Example using two calls, then merge in code:
// const { data: users } = await supabaseB.from('auth.users').select('id, email');
```

Past sessions list (Project B, server-only)

```ts
// Filter by current user (anon key + RLS) or by explicit userId when using service role
// With anon + RLS (recommended):
const { data: sessions } = await supabaseB
  .from("sessions")
  .select("id, start_time, end_time, status, summary, recording_url")
  .order("start_time", { ascending: false })
  .limit(50);

// With service role (must pass the userId explicitly; do NOT expose this client to the browser):
const { data: sessions } = await supabaseB
  .from("sessions")
  .select("id, start_time, end_time, status, summary, recording_url")
  .eq("user_id", userId)
  .order("start_time", { ascending: false })
  .limit(50);
```

Filter sessions by selected client (Project B)

```ts
// selectedClientId comes from the dropdown (profiles.id)
const { data: sessions } = await supabaseB
  .from("sessions")
  .select("id, start_time, end_time, status, summary, recording_url")
  .eq("user_id", selectedClientId)
  .order("start_time", { ascending: false })
  .limit(50);
```

---

#### End-to-end: building the Sessions view

Goal

- Populate a client dropdown from `public.profiles`.
- Show a list of past sessions for the selected client from `public.sessions`.

1. Fetch clients (profiles) for dropdown (Project B)

```ts
// Prefer server components or route handlers when you need to merge with auth.users
// Basic dropdown using profiles only:
const { data: clients, error } = await supabaseB
  .from("profiles")
  .select("id, name, avatar")
  .order("name", { ascending: true });

// Optional: also fetch email via auth.users on the server and merge by id
// const { data: users } = await supabaseB.from('auth.users').select('id, email');
```

2. Show past sessions for a selected client (Project B)

```ts
// selectedClientId = profiles.id
const { data: sessions, error } = await supabaseB
  .from("sessions")
  .select(
    [
      "id",
      "start_time",
      "end_time",
      "status",
      "summary",
      "recording_url",
      // include lightweight meta fields as needed
    ].join(",")
  )
  .eq("user_id", selectedClientId)
  .order("start_time", { ascending: false })
  .limit(50);
```

3. Recommended field choices

- Client dropdown: `profiles.id`, `profiles.name`, `profiles.avatar` (fallback to email if name is null).
- Sessions list item: `id`, `start_time`, `end_time`, `status`, `summary` (truncate), optionally `recording_url` if you render a playback action.

4. Security guidance

- Anon key + RLS: Ensure `profiles` and `sessions` have RLS policies so users only see allowed rows.
- Service role: Only use on the server and return minimal fields in your API responses.

5. Example join strategy (server-only)

```ts
// If you need to render client email with sessions, fetch separately and merge in memory
const { data: profiles } = await supabaseB
  .from("profiles")
  .select("id, name, avatar");
const { data: users } = await supabaseB.from("auth.users").select("id, email");

const idToEmail = new Map(users?.map((u) => [u.id, u.email]) ?? []);
const enhancedProfiles = (profiles ?? []).map((p) => ({
  ...p,
  email: idToEmail.get(p.id) ?? null,
}));
```

6. Filtering and pagination

- Use `.order("start_time", { ascending: false })` with `.range(from, to)` for paging.
- For date windows, add `.gte("start_time", fromIso).lte("start_time", toIso)`.

7. Indexing (DB-side consideration)

- Ensure an index on `sessions(user_id, start_time desc)` for fast lookups.

---

#### Auth and cookies across two projects

- Each Supabase project uses a different cookie name (`sb-<project_ref>-auth-token`), so using both is safe.
- Keep a single “source of truth” for user auth (Project A). Only use Project B authentication if you truly need separate login there.
- If you don’t want dual auth, prefer server-only access to Project B (anon for public data with strict RLS, or service role for trusted reads + filtered API responses).

---

#### RLS guidance

- If you expose Project B anon to the browser, define RLS in Project B that strictly limits data per user.
- If you use Project B service role, never call it from the browser; always proxy on the server and only return the minimum required fields.

---

#### TypeScript typing (optional)

You can generate types per project and create two `Database` types (e.g., `DatabaseA`, `DatabaseB`) to pass to the clients:

```ts
// const supabaseA = createBrowserClient<DatabaseA>(...)
// const supabaseB = createClient<DatabaseB>(...)
```

---

#### Troubleshooting

- 401/403 from B: ensure correct key (anon vs service) and RLS/policies in B.
- Random signouts: confirm your middleware only refreshes Project A; don’t mutate B’s cookies unless you actually sign users into B.
- CORS: if calling B directly from the browser, ensure CORS settings in B allow your app origin.

---

#### Next steps

- Start with multiple clients (above).
- If you later need cross-DB JOINs or a single API surface, consider:
  - Database link via `postgres_fdw`, or
  - A server/Edge Function in Project A that aggregates data from B.
