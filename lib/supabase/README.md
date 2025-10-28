# Multiple Supabase Clients Setup

This directory contains clients for two Supabase projects:

## Project A (Primary - Clients)
- **client-a.ts**: Browser client for Project A
- **server-a.ts**: Server client for Project A (with cookie handling)
- Used for: Primary authentication, clients management, main application data

### Usage in Client Components:
```typescript
import { createClientA } from "@/lib/supabase/client-a";

const supabase = createClientA();
const { data } = await supabase.from("clients").select("*");
```

### Usage in Server Components/Actions/Routes:
```typescript
import { createServerClientA } from "@/lib/supabase/server-a";

const supabase = await createServerClientA();
const { data } = await supabase.from("clients").select("*");
```

## Project B (Secondary - Sessions)
- **server-b.ts**: Service role client for Project B (server-only)
- Used for: Sessions data, transcriptions, recordings
- **SECURITY**: This uses a service role key and bypasses RLS. Never expose to browser.

### Usage (Server-only):
```typescript
import { createServiceClientB } from "@/lib/supabase/server-b";

const supabase = createServiceClientB();
const { data } = await supabase.from("sessions").select("*");
```

### Usage via API Proxy (Recommended):
```typescript
// In your component
const response = await fetch("/api/sessions-b?userId=xxx&limit=50");
const { sessions } = await response.json();
```

## Environment Variables

Make sure to add these to your `.env.local`:

```env
# Project A
NEXT_PUBLIC_SUPABASE_URL=your-project-a-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-project-a-anon-key

# Project B
NEXT_PUBLIC_SUPABASE_URL_B=your-project-b-url
SUPABASE_SERVICE_ROLE_KEY_B=your-project-b-service-role-key
```

## Important Notes

1. **Authentication**: Only Project A handles user authentication. Middleware only refreshes Project A sessions.
2. **RLS**: Project B uses service role, so RLS is bypassed. Always filter data on the server before returning to client.
3. **Cookies**: Each project uses separate cookies (`sb-<project_ref>-auth-token`), so they don't conflict.
4. **API Routes**: Use `/api/sessions-b` to safely fetch Project B data with proper filtering.

## Migration from Single Client

All existing imports have been updated from:
```typescript
import { createClient } from "@/lib/supabase/server";
```

To:
```typescript
import { createServerClientA } from "@/lib/supabase/server-a";
```

This ensures backward compatibility while supporting the new multi-project setup.
