# Supabase Setup Guide

## ✅ Completed Setup

Your Supabase integration is now configured! Here's what was done:

### 1. Dependencies Installed

- ✅ `@supabase/supabase-js` - Supabase client library
- ✅ `@supabase/ssr` - Server-side rendering support for Next.js 15

### 2. Files Created

#### Supabase Client Utilities

- **`lib/supabase/client.ts`** - Browser client for client components
- **`lib/supabase/server.ts`** - Server client for server components and actions
- **`middleware.ts`** - Auth middleware with route protection

#### Type Definitions

- **`lib/types.ts`** - TypeScript types for all database tables

#### Environment Configuration

- **`.env.local`** - Environment variables (already configured with your Supabase project)

### 3. Database Setup

- ✅ All tables created (profiles, clients, sessions, recordings)
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Storage bucket created (audio-recordings)
- ✅ All security policies applied

### 4. Middleware Configuration

The middleware automatically:

- Refreshes auth sessions
- Protects `/dashboard/*` routes (requires authentication)
- Redirects logged-in users away from `/login` and `/signup`
- Allows public access to auth pages

## 🔧 Configuration Required

### 1. Add Service Role Key (Optional)

For server-side operations that bypass RLS, you'll need the Service Role Key:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ofzicxdmlezuwipdjzfn/settings/api)
2. Copy the **Service Role Key** (keep this secret!)
3. Add it to `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

⚠️ **Warning**: The Service Role Key bypasses RLS policies. Only use it in secure server-side code.

### 2. Set Up External Services (For Later Phases)

#### Daily.co (Video Calling)

1. Sign up at https://dashboard.daily.co/signup
2. Get your API key from Dashboard > Developers
3. Add to `.env.local`:
   ```env
   DAILY_API_KEY=your-daily-api-key
   ```
4. Free tier: 10,000 minutes/month

#### Groq API (Transcription)

1. Sign up at https://console.groq.com/
2. Navigate to API Keys section
3. Create new API key
4. Add to `.env.local`:
   ```env
   GROQ_API_KEY=your-groq-api-key
   ```
5. Free tier available with rate limits

## 📝 Usage Examples

### Browser Client (Client Components)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function MyComponent() {
  const supabase = createClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: clients } = await supabase.from("clients").select("*");
      setData(clients || []);
    }
    fetchData();
  }, []);

  return <div>{/* Your UI */}</div>;
}
```

### Server Client (Server Components)

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      {clients?.map((client) => (
        <div key={client.id}>{client.full_name}</div>
      ))}
    </div>
  );
}
```

### Server Actions

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("clients").insert({
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    therapist_id: (await supabase.auth.getUser()).data.user?.id,
  });

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  return data;
}
```

### Get Current User

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
```

## 🧪 Test Your Setup

Create a simple test page to verify everything works:

```typescript
// app/test-supabase/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function TestSupabase() {
  const supabase = await createClient();

  // Test database connection
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {error ? (
        <div className="text-red-500">
          <p>Error: {error.message}</p>
        </div>
      ) : (
        <div className="text-green-500">
          <p>✅ Connected successfully!</p>
          <p>Profiles table accessible</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(profiles, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

Visit http://localhost:3000/test-supabase to test the connection.

## 🗂️ Project Structure

```
empath-dashboard/
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   └── types.ts              # Database types
├── middleware.ts             # Auth middleware
├── .env.local                # Environment variables (configured)
└── DATABASE_SETUP.md         # Database schema reference
```

## 🔐 Security Best Practices

1. **Never expose Service Role Key**: Only use in server-side code
2. **Use RLS policies**: All queries go through Row Level Security
3. **Validate user input**: Always validate data before inserting
4. **Use TypeScript types**: Leverage the types in `lib/types.ts`
5. **Keep .env.local secret**: Never commit to version control

## 📚 Next Steps

Now that Supabase is set up, you can proceed with:

### Phase 1: Authentication

1. Create authentication pages:
   - `app/(auth)/login/page.tsx`
   - `app/(auth)/signup/page.tsx`
2. Implement sign up/login/logout functionality
3. Create protected dashboard layout

### Phase 2: Clients Module

1. Create clients table UI
2. Implement CRUD operations
3. Add client profile pages

### Phase 3: Sessions Module

1. Create session scheduling UI
2. Integrate calendar library
3. Implement session management

## 🆘 Troubleshooting

### Issue: "Invalid API key"

- Check that your `.env.local` is properly configured
- Restart your dev server after changing env variables: `npm run dev`

### Issue: "RLS policies blocking access"

- Ensure user is authenticated
- Verify that `auth.uid()` matches the resource owner
- Check policies in Supabase Dashboard > Authentication > Policies

### Issue: "Cookies not working"

- Make sure you're using the correct client (browser vs server)
- Check that middleware is properly configured
- Verify Next.js 15 is using `await cookies()`

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/ofzicxdmlezuwipdjzfn)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 15 Documentation](https://nextjs.org/docs)

---

**Setup completed on:** October 19, 2025  
**Supabase Project:** ofzicxdmlezuwipdjzfn  
**Status:** ✅ Ready for authentication implementation
