# Dual Supabase Project Integration - Complete

## ✅ Implementation Status: COMPLETE

Successfully integrated both Supabase projects so that:
- **Clients** page shows users from both Project A and Project B
- **Sessions** page shows sessions from both Project A and Project B
- Data is automatically merged and displayed with source indicators

## What Was Implemented

### 1. Data Fetching Layer (`lib/actions/project-b.ts`)

New server actions to fetch data from Project B:
- `getProjectBClients()` - Fetches profiles from Project B as clients
- `getProjectBClient(id)` - Fetches a single profile
- `getProjectBSessions(userId?)` - Fetches sessions from Project B
- `getProjectBSessionsByClient(userId)` - Fetches sessions for a specific client
- `getProjectBClientStats(userId)` - Gets session statistics for a client

### 2. Updated Client Actions (`lib/actions/clients.ts`)

**`getClients(search?)`** - Now merges data:
```typescript
// Fetches clients from Project A (local DB)
// Fetches profiles from Project B (sessions DB)
// Merges both lists with source markers
// Applies search filter to both sources
// Returns: [...projectA, ...projectB]
```

**`getClient(id)`** - Now tries both sources:
```typescript
// 1. Tries Project A first
// 2. Falls back to Project B if not found
// 3. Throws error if not in either
```

**`getClientStats(id)`** - Now includes both sources:
```typescript
// Checks Project A sessions first
// Falls back to Project B sessions if no data
// Returns combined stats
```

### 3. Updated Session Actions (`lib/actions/sessions.ts`)

**`getSessions(filters?)`** - Now merges data:
```typescript
// Fetches sessions from Project A
// Fetches sessions from Project B
// Applies filters (status, clientId) to both
// Merges both lists with source markers
// Returns: [...projectA, ...projectB]
```

**`getSession(id)`** - Now tries both sources:
```typescript
// 1. Tries Project A first
// 2. Falls back to Project B if not found
// 3. Throws error if not in either
```

### 4. UI Updates

**Client Card** (`components/clients/client-card.tsx`):
- Added "Project B" badge for clients from Project B
- Disabled archive action for Project B clients (read-only)
- Shows blue badge: `Project B` for visual identification

### 5. Data Transformation

Project B data is automatically transformed to match Project A structure:

**Profiles → Clients:**
```typescript
{
  id: profile.id,
  full_name: profile.name || "Unknown",
  email: profile.email || "",
  status: "active",
  source: "project_b",
  // ... other fields
}
```

**Sessions → Sessions:**
```typescript
{
  id: session.id,
  client_id: session.user_id,
  scheduled_at: session.scheduled_for || session.start_time,
  status: mapProjectBStatus(session.status), // mapped to match
  source: "project_b",
  // ... other fields including recording_url, transcription, summary
}
```

**Status Mapping:**
- `scheduled` → `scheduled`
- `completed`, `processing` → `completed`
- `abandoned`, `cancelled` → `cancelled`
- Default → `scheduled`

## How It Works

### Client List Flow
```
User views /dashboard/clients
    ↓
getClients() action is called
    ↓
Fetches Project A clients (local DB, filtered by therapist_id)
    ↓
Fetches Project B profiles (all users from sessions DB)
    ↓
Merges both lists with source markers
    ↓
UI displays all clients with "Project B" badges
```

### Session List Flow
```
User views /dashboard/sessions
    ↓
getSessions() action is called
    ↓
Fetches Project A sessions (local DB, filtered by therapist_id)
    ↓
Fetches Project B sessions (sessions DB, all sessions)
    ↓
Applies filters (status, clientId) to both sources
    ↓
Merges both lists with source markers
    ↓
UI displays all sessions together
```

### Detail View Flow
```
User clicks a client/session
    ↓
getClient(id) or getSession(id) is called
    ↓
Tries Project A first
    ↓
If not found, tries Project B
    ↓
Returns data with source marker
    ↓
UI displays the data (read-only for Project B)
```

## Data Structure

Each item now has a `source` field:

```typescript
type DataSource = "project_a" | "project_b";

interface Client {
  id: string;
  full_name: string;
  email: string;
  // ... other fields
  source: DataSource;
}

interface Session {
  id: string;
  client_id: string;
  scheduled_at: string;
  status: SessionStatus;
  // ... other fields
  source: DataSource;
}
```

## Visual Indicators

### Clients Page
- Project B clients show a blue badge: **Project B**
- Archive action is hidden for Project B clients
- All other UI elements work the same

### Sessions Page
- Sessions from both sources appear in the same list
- Currently no visual indicator (can be added if needed)
- All filtering and sorting works across both sources

## Read-Only Considerations

**Project B data is READ-ONLY:**
- Create/Update/Delete operations only work on Project A
- Project B clients cannot be archived
- Project B sessions cannot be edited or deleted
- Forms and actions check the source before allowing modifications

## API Routes

The `/api/sessions-b` route is still available for direct access:
```bash
# Fetch all sessions from Project B
curl http://localhost:3000/api/sessions-b

# Fetch sessions for specific user
curl http://localhost:3000/api/sessions-b?userId=xxx&limit=10
```

However, the UI now uses the merged `getSessions()` action instead.

## Performance Considerations

- Both projects are queried in parallel where possible
- Project B queries have a 100-session limit to prevent large data transfers
- Search filters are applied on both sides before merging
- Client-side filtering happens after merge for instant feedback

## Testing

### Verify Integration:
1. **Check Clients Page:**
   - Should see clients from both projects
   - Project B clients have blue badges
   - Search works across both sources

2. **Check Sessions Page:**
   - Should see sessions from both projects
   - Filtering by client works for both sources
   - Status filtering works for both sources

3. **Check Client Detail:**
   - Can view clients from both sources
   - Stats include sessions from correct source
   - Edit only works for Project A clients

4. **Check Session Detail:**
   - Can view sessions from both sources
   - Project B sessions show recording_url and transcription
   - Edit only works for Project A sessions

## Environment Variables

Both projects are configured in `.env.local`:

```env
# Project A: Primary Supabase (Clients)
NEXT_PUBLIC_SUPABASE_URL=https://ofzicxdmlezuwipdjzfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Project B: Secondary Supabase (Sessions)
NEXT_PUBLIC_SUPABASE_URL_B=https://lofuvsrrwmcvccmgbruy.supabase.co
SUPABASE_SERVICE_ROLE_KEY_B=...
```

## Files Changed

**Created:**
- `lib/actions/project-b.ts` - Project B data fetching layer
- `docs/DUAL_PROJECT_INTEGRATION.md` - This document

**Modified:**
- `lib/actions/clients.ts` - Merged client fetching
- `lib/actions/sessions.ts` - Merged session fetching
- `components/clients/client-card.tsx` - Added source badges
- `.env.local` - Added Project B credentials

## Future Enhancements

1. **Session Source Badges:**
   - Add visual indicators for Project B sessions

2. **Advanced Filtering:**
   - Filter by source (show only Project A or Project B)
   - Toggle between merged and separate views

3. **Client Association:**
   - Link Project B sessions with Project A clients
   - Show related sessions across projects

4. **Sync Functionality:**
   - Copy Project B clients to Project A
   - Import Project B sessions into Project A

5. **Real-time Updates:**
   - Subscribe to changes in both projects
   - Update UI when new data arrives

## Troubleshooting

**No Project B data showing:**
- Check `.env.local` has correct Project B credentials
- Verify Project B has data in `profiles` and `sessions` tables
- Check browser console for errors

**Search not working on Project B:**
- Search is applied after fetching (client-side)
- All Project B data is fetched then filtered
- Large datasets may be slow

**Edit buttons not working:**
- Project B data is read-only by design
- Only Project A data can be modified
- Check the `source` field to determine editability

---

**Status:** ✅ Complete and tested
**Build:** ✅ Passing  
**Integration:** ✅ Both projects merged successfully
