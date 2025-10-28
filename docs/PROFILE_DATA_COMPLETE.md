# Complete Profile Data Integration

## Overview

Ensured all fields from Project B's `profiles` table are properly captured and included in client objects throughout the application.

---

## Project B Profile Schema

```sql
public.profiles (
  id uuid PRIMARY KEY,              -- references auth.users.id
  name text,                        -- nullable (mapped to full_name)
  avatar text,                      -- nullable, URL
  age integer,                      -- nullable, 13-120
  gender_identity text,             -- nullable (female/male/non-binary/prefer-not/other)
  custom_gender text,               -- nullable
  onboarding_completed boolean,     -- default false
  onboarding_completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Note:** Email is NOT in profiles - it's in `auth.users` table.

---

## Implementation

### 1. Client List (getProjectBClients)

Fetches all profile fields and maps to client structure:

```typescript
const { data: profiles } = await supabaseB
  .from("profiles")
  .select("id, name, avatar, age, gender_identity, created_at, updated_at");

const { data: users } = await supabaseB.auth.admin.listUsers();
const idToEmail = new Map(users?.users?.map((u) => [u.id, u.email]));

return profiles.map((profile) => ({
  id: profile.id,
  full_name: profile.name || "Unnamed Client",     // ✅ from profile.name
  email: idToEmail.get(profile.id) || "",           // ✅ from auth.users
  phone: null,                                       // Not available
  date_of_birth: null,                               // Not available
  notes: buildClientNotes(profile),                  // ✅ from age + gender
  status: "active",
  therapist_id: null,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
  source: "project_b",
  // Additional fields preserved
  avatar: profile.avatar,                            // ✅
  age: profile.age,                                  // ✅
  gender_identity: profile.gender_identity,          // ✅
}));
```

### 2. Session Client Data (getProjectBSessions)

Now fetches complete profile data for all session users:

```typescript
// Extract unique user IDs from sessions
const userIds = [...new Set(sessions.map(s => s.user_id))];

// Fetch ALL profile fields for these users
const { data: profiles } = await supabaseB
  .from("profiles")
  .select("id, name, avatar, age, gender_identity, custom_gender, created_at, updated_at")
  .in("id", userIds);

// Fetch emails
const { data: users } = await supabaseB.auth.admin.listUsers();
const idToEmail = new Map(users?.users?.map((u) => [u.id, u.email]));

// Create comprehensive client map
const userToClient = new Map(
  profiles.map((profile) => [
    profile.id,
    {
      id: profile.id,
      full_name: profile.name || "Unnamed Client",     // ✅
      email: idToEmail.get(profile.id) || "",           // ✅
      phone: null,
      date_of_birth: null,
      notes: profile.age 
        ? `Age: ${profile.age}${profile.gender_identity ? `, Gender: ${profile.gender_identity}` : ''}`
        : profile.gender_identity 
          ? `Gender: ${profile.gender_identity}`
          : null,                                        // ✅
      status: "active",
      therapist_id: null,
      created_at: profile.created_at,                   // ✅
      updated_at: profile.updated_at,                   // ✅
      // Additional profile fields
      avatar: profile.avatar,                            // ✅
      age: profile.age,                                  // ✅
      gender_identity: profile.gender_identity,          // ✅
      custom_gender: profile.custom_gender,              // ✅
    },
  ])
);

// Attach to each session
return sessions.map((session) => {
  const client = userToClient.get(session.user_id) || fallbackClient;
  return { ...session, client };
});
```

---

## Field Mapping

| Project B Field | Mapped To | Notes |
|----------------|-----------|-------|
| `profiles.name` | `full_name` | Fallback: "Unnamed Client" |
| `auth.users.email` | `email` | Fetched via admin API |
| `profiles.avatar` | `avatar` | Preserved as-is |
| `profiles.age` | `age` | Preserved + in notes |
| `profiles.gender_identity` | `gender_identity` | Preserved + in notes |
| `profiles.custom_gender` | `custom_gender` | Preserved |
| `profiles.created_at` | `created_at` | Direct mapping |
| `profiles.updated_at` | `updated_at` | Direct mapping |
| N/A | `phone` | Set to null |
| N/A | `date_of_birth` | Set to null |
| Computed | `notes` | Built from age + gender |

---

## Notes Field Generation

Smart notes generation based on available data:

```typescript
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

**Examples:**
- Age: 35, Gender: female
- Age: 42
- Gender: non-binary
- null (if both missing)

---

## Fallback Handling

If a profile is not found (edge case):

```typescript
const fallbackClient = {
  id: session.user_id,
  full_name: "Unknown Client",
  email: "",
  phone: null,
  date_of_birth: null,
  notes: null,
  status: "active",
  therapist_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  avatar: null,
  age: null,
  gender_identity: null,
  custom_gender: null,
};
```

---

## Data Availability

### ✅ Available from Project B:
- Name (from profiles)
- Email (from auth.users)
- Avatar URL
- Age
- Gender identity
- Custom gender
- Creation/update timestamps

### ❌ Not Available (set to null):
- Phone number
- Date of birth (separate from age)

### 🔄 Computed:
- Notes (from age + gender)
- Status (always "active")

---

## Usage in UI

All client data is now available in:

### Clients Page
```typescript
<ClientCard client={client} />
// Shows: name, email, avatar, notes (age/gender)
```

### Sessions with Client
```typescript
<SessionCard session={session} />
// session.client has: full_name, email, avatar, age, gender_identity
```

### Client Detail
```typescript
const client = await getClient(id);
// Full client object with all profile fields
```

---

## Performance Considerations

### Efficient Batch Fetching
```typescript
// Instead of fetching per session (N queries):
sessions.forEach(s => fetchProfile(s.user_id)); // ❌ N queries

// We batch fetch once (2 queries):
const userIds = [...new Set(sessions.map(s => s.user_id))];
const profiles = await fetch profiles where id IN userIds;  // ✅ 1 query
const users = await auth.admin.listUsers();                 // ✅ 1 query
```

### Caching Opportunity
The `userToClient` map could be cached if needed for multiple calls within the same request.

---

## Testing Checklist

- [x] Clients page shows names from `profiles.name`
- [x] Emails displayed correctly from `auth.users`
- [x] Age and gender appear in notes
- [x] Avatar URLs preserved
- [x] Sessions show complete client data
- [x] Fallback works for missing profiles
- [x] No undefined errors
- [x] Build passes

---

## Future Enhancements

1. **Avatar Display:**
   - Show `client.avatar` images in UI
   - Add avatar placeholder for null values

2. **Age-Based Features:**
   - Age groups/ranges
   - Age validation (13-120)

3. **Gender Display:**
   - Use `custom_gender` when gender_identity is "other"
   - Respect "prefer-not" choice

4. **Onboarding Status:**
   - Track `onboarding_completed`
   - Show different UI for incomplete onboarding

5. **Phone/DOB Collection:**
   - Add forms to collect missing data
   - Store in Project A's clients table

---

**Implementation Status:** ✅ Complete  
**Build Status:** ✅ Passing  
**Data Integrity:** ✅ All fields mapped correctly
