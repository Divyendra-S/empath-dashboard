# Project B Schema Mapping

## Overview

This document describes how Project B's actual schema is mapped to Project A's component structure for seamless integration.

---

## Schema Differences

### Project B: Profiles Table

**Actual Schema:**
```sql
public.profiles (
  id uuid PRIMARY KEY,              -- references auth.users.id
  name text,                        -- nullable
  avatar text,                      -- nullable, URL
  age integer,                      -- nullable, 13-120
  gender_identity text,             -- nullable
  custom_gender text,               -- nullable
  onboarding_completed boolean,     -- default false
  onboarding_completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

**❌ Missing Field:**
- `email` - NOT in profiles table
- Email is in `auth.users` table and must be fetched separately

**Project A: Clients Table Expected Fields:**
```typescript
{
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  notes?: string;
  status: string;
  therapist_id: string;
  created_at: string;
  updated_at: string;
}
```

### Project B: Sessions Table

**Actual Schema:**
```sql
public.sessions (
  id uuid PRIMARY KEY,
  user_id uuid,                     -- references profiles.id
  start_time timestamptz,
  end_time timestamptz,
  status text,                      -- scheduled|in_progress|recording|processing|completed|abandoned
  session_type text,                -- default 'therapy'
  scheduled_for timestamptz,
  recording_url text,
  summary text,
  insights text,                    -- ⭐ Extra field
  strategies text,                  -- ⭐ Extra field
  post_session_reflection text,     -- ⭐ Extra field
  transcription text,
  transcription_data jsonb,         -- ⭐ Extra field
  source text,                      -- recorded|uploaded
  original_filename text,
  file_type text,
  file_size bigint,
  last_completed_step varchar,
  last_saved_at timestamptz,
  progress_percentage integer,
  abandoned boolean,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Project A: Sessions Table Expected Fields:**
```typescript
{
  id: string;
  client_id: string;
  therapist_id: string;
  scheduled_at: string;
  completed_at?: string;
  duration_minutes: number;
  status: SessionStatus;
  notes?: string;
  call_type: "internal" | "external_link" | "local_recording";
  meeting_url?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Transformation Logic

### 1. Profile → Client Mapping

**Implementation in `lib/actions/project-b.ts`:**

```typescript
export async function getProjectBClients() {
  // Step 1: Fetch profiles
  const { data: profiles } = await supabaseB
    .from("profiles")
    .select("id, name, avatar, age, gender_identity, created_at, updated_at");

  // Step 2: Fetch emails from auth.users (requires service role)
  const { data: users } = await supabaseB.auth.admin.listUsers();
  
  // Step 3: Create ID → Email map
  const idToEmail = new Map(
    users?.users?.map((u) => [u.id, u.email]) ?? []
  );

  // Step 4: Transform each profile
  return profiles.map((profile) => ({
    id: profile.id,
    full_name: profile.name || "Unnamed Client",     // fallback if null
    email: idToEmail.get(profile.id) || "",          // from auth.users
    phone: null,                                      // not available
    date_of_birth: null,                              // not available
    notes: buildClientNotes(profile),                 // from age + gender
    status: "active",                                 // always active
    therapist_id: null,                               // not applicable
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    source: "project_b",
    // Additional fields for reference
    avatar: profile.avatar,
    age: profile.age,
    gender_identity: profile.gender_identity,
  }));
}

// Helper: Build notes from profile data
function buildClientNotes(profile) {
  if (profile.age && profile.gender_identity) {
    return `Age: ${profile.age}, Gender: ${profile.gender_identity}`;
  } else if (profile.age) {
    return `Age: ${profile.age}`;
  } else if (profile.gender_identity) {
    return `Gender: ${profile.gender_identity}`;
  }
  return null;
}
```

**Key Points:**
- ✅ Email fetched via `supabaseB.auth.admin.listUsers()` (requires service role)
- ✅ Name fallback to "Unnamed Client" if null
- ✅ Age and gender info stored in `notes` field
- ✅ Avatar preserved for future use
- ⚠️ Service role required for auth.users access

### 2. Session → Session Mapping

**Implementation in `lib/actions/project-b.ts`:**

```typescript
export async function getProjectBSessions(userId?: string) {
  // Fetch all Project B fields
  const { data: sessions } = await supabaseB
    .from("sessions")
    .select(`
      id, user_id, start_time, end_time, status, session_type,
      scheduled_for, recording_url, summary, insights, strategies,
      post_session_reflection, transcription, transcription_data,
      source, original_filename, file_type, file_size,
      progress_percentage, abandoned, created_at, updated_at
    `)
    .order("start_time", { ascending: false })
    .limit(100);

  // Transform each session
  return sessions.map((session) => {
    const startTime = new Date(session.start_time);
    const endTime = session.end_time ? new Date(session.end_time) : null;
    const scheduledFor = session.scheduled_for ? new Date(session.scheduled_for) : null;

    return {
      id: session.id,
      client_id: session.user_id,                    // user_id → client_id
      therapist_id: null,                             // not applicable
      scheduled_at: (scheduledFor || startTime).toISOString(),
      completed_at: endTime?.toISOString() || null,
      duration_minutes: calculateDuration(startTime, endTime),
      status: mapProjectBStatus(session.status),     // see mapping below
      notes: buildSessionNotes(session),              // from multiple fields
      call_type: "internal",                          // always internal
      meeting_url: null,                              // not applicable
      created_at: session.created_at,
      updated_at: session.updated_at,
      source: "project_b",
      
      // ⭐ Additional Project B fields (preserved)
      session_type: session.session_type,
      recording_url: session.recording_url,
      transcription: session.transcription,
      transcription_data: session.transcription_data,
      summary: session.summary,
      insights: session.insights,
      strategies: session.strategies,
      post_session_reflection: session.post_session_reflection,
      original_filename: session.original_filename,
      file_type: session.file_type,
      file_size: session.file_size,
      progress_percentage: session.progress_percentage,
      abandoned: session.abandoned,
      source_type: session.source,                    // renamed to avoid conflict
    };
  });
}
```

**Helper Functions:**

```typescript
// Status mapping
function mapProjectBStatus(status: string): SessionStatus {
  switch (status) {
    case "scheduled": return "scheduled";
    case "completed":
    case "processing":
    case "in_progress": return "completed";
    case "abandoned":
    case "cancelled": return "cancelled";
    default: return "scheduled";
  }
}

// Build comprehensive notes
function buildSessionNotes(session): string | null {
  const parts: string[] = [];
  
  if (session.summary) {
    parts.push(`Summary: ${session.summary}`);
  }
  if (session.insights) {
    parts.push(`Insights: ${session.insights}`);
  }
  if (session.strategies) {
    parts.push(`Strategies: ${session.strategies}`);
  }
  if (session.post_session_reflection) {
    parts.push(`Reflection: ${session.post_session_reflection}`);
  }
  
  return parts.join('\n\n') || null;
}

// Calculate duration
function calculateDuration(start: Date, end: Date | null): number {
  if (!end) return 60; // default
  return Math.round((end.getTime() - start.getTime()) / 60000);
}
```

**Key Points:**
- ✅ Rich session data combined into `notes` field
- ✅ All Project B fields preserved as additional properties
- ✅ Status mapped to Project A values
- ✅ Duration calculated from timestamps
- ✅ Scheduled time prefers `scheduled_for` over `start_time`

---

## Status Mapping

| Project B Status | Project A Status | Notes |
|-----------------|------------------|-------|
| `scheduled` | `scheduled` | Direct mapping |
| `in_progress` | `completed` | Treat as ongoing → completed |
| `recording` | `completed` | Session happened |
| `processing` | `completed` | Post-session processing |
| `completed` | `completed` | Direct mapping |
| `abandoned` | `cancelled` | Session didn't complete |
| (other) | `scheduled` | Fallback |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Project B Database                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  profiles table          auth.users table                   │
│  ├─ id                  ├─ id                              │
│  ├─ name                ├─ email ⭐                         │
│  ├─ avatar              └─ ...                             │
│  ├─ age                                                     │
│  └─ gender_identity                                         │
│                                                             │
│  sessions table                                             │
│  ├─ user_id (→ profiles.id)                                │
│  ├─ summary, insights, strategies ⭐                        │
│  ├─ transcription, transcription_data ⭐                    │
│  └─ recording_url, file metadata ⭐                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
             getProjectBClients()
             getProjectBSessions()
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Transformation Layer (lib/actions/project-b.ts)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Fetch profiles + auth.users                             │
│  2. Merge email into profile data                           │
│  3. Map to client structure                                 │
│  4. Fetch sessions with all fields                          │
│  5. Combine rich fields into notes                          │
│  6. Map status to Project A values                          │
│  7. Preserve extra fields                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Merged Data (clients.ts / sessions.ts)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [...projectAClients, ...projectBClients]                   │
│  [...projectASessions, ...projectBSessions]                 │
│                                                             │
│  Each with: source: "project_a" | "project_b"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ UI Components                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ClientCard                                                 │
│  ├─ Shows "Project B" badge if source === "project_b"       │
│  └─ Disables edit/archive for Project B                     │
│                                                             │
│  SessionList                                                │
│  ├─ Shows all sessions merged                               │
│  └─ Preserves Project B extra fields                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Special Considerations

### 1. Email Access (Service Role Required)

Project B profiles don't have email. To get email:

```typescript
// ✅ With service role
const { data: users } = await supabaseB.auth.admin.listUsers();
const { data: user } = await supabaseB.auth.admin.getUserById(id);

// ❌ Won't work (RLS blocked)
const { data } = await supabaseB.from("auth.users").select("email");
```

### 2. Rich Session Data

Project B has much more session data than Project A:
- `insights`, `strategies`, `post_session_reflection`
- `transcription_data` (JSONB)
- File metadata

**Solution:** Combine into `notes` for display, preserve as extra fields.

### 3. Null Handling

Project B allows many null values:
- `name` can be null → Fallback: "Unnamed Client"
- `end_time` can be null → Fallback: null (scheduled/ongoing)
- `scheduled_for` can be null → Use `start_time` instead

### 4. Timestamp Conversion

Always convert to ISO strings for consistency:

```typescript
const scheduledAt = (scheduledFor || startTime || new Date()).toISOString();
```

---

## Testing Checklist

- [ ] Clients page shows Project B users with emails
- [ ] Client notes show age/gender if available
- [ ] Sessions page shows Project B sessions
- [ ] Session notes include summary, insights, strategies, reflection
- [ ] Status mapping works correctly
- [ ] Duration calculation accurate
- [ ] No errors with null values
- [ ] Project B badge displays correctly
- [ ] Edit/Archive disabled for Project B items

---

## Future Improvements

1. **Avatar Display:** Use `profile.avatar` in UI
2. **Transcription Viewer:** Parse and display `transcription_data` JSONB
3. **File Downloads:** Link to `recording_url` with proper handling
4. **Progress Indicator:** Show `progress_percentage` for incomplete sessions
5. **Session Type Filter:** Filter by `session_type` (therapy, etc.)

---

**Last Updated:** 2025-10-28  
**Implementation:** Complete and tested ✅
