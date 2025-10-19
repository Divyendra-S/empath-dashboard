# Empath Dashboard - Execution Plan

> **Note:** For detailed code examples and implementation details, refer to `IMPLEMENTATION_PLAN.md`

---

## Project Overview

Building a therapist dashboard with core session management features: client management, integrated calendar scheduling, session recording with audio transcription, and session history.

**Timeline:** 5-6 weeks (6 phases)
**Team Size:** 1-2 developers  
**Complexity:** Intermediate to Advanced

**Key Feature:** Integrated calendar view with drag-and-drop rescheduling, inspired by [Upheal](https://app.upheal.io/calendar)

---

## Tech Stack Summary

### Core Technologies

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Video Calling:** Daily.co API (10,000 free minutes/month)
- **Transcription:** Groq API with Whisper Large v3 (32x faster than OpenAI)
- **Recording:** MediaRecorder API + Daily.co cloud recording

### Why This Stack?

- **Cost-Effective:** ~$25-37/month for 50 sessions
- **Fast Transcription:** Process 1-hour audio in ~2 minutes
- **Flexible Calling:** Built-in video calls OR external Zoom/Meet links
- **Production Ready:** All services have HIPAA-compliant options
- **Great DX:** Modern TypeScript stack with excellent tooling

---

## Core Features

1. **Home Dashboard** - Overview cards, activity timeline, quick actions
2. **Clients** - Directory, profiles, session history, CRUD operations
3. **Sessions with Calendar** - List & calendar views (month/week/day), drag-to-reschedule, click-to-edit, create from calendar, status indicators, detail pages, recording interface, transcript display
4. **Video Calling & Recording** - Built-in Daily.co calls or external links (Zoom/Meet) with local recording
5. **Transcription** - Ultra-fast Groq API transcription with Whisper Large v3

---

## Quick Setup Checklist

### 1. Create Accounts

- [ ] Daily.co account → Get API key → Add to `.env.local`
- [ ] Groq API account → Create API key → Add to `.env.local`
- [ ] Supabase project → Get credentials → Add to `.env.local`

### 2. Initial Setup

- [ ] Install dependencies (see IMPLEMENTATION_PLAN.md)
- [ ] Initialize shadcn/ui
- [ ] Set up Supabase database schema
- [ ] Create storage bucket for audio files
- [ ] Apply RLS policies
- [ ] Configure middleware for auth
- [ ] Install calendar library: `react-big-calendar` + `date-fns`

### 3. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DAILY_API_KEY=
GROQ_API_KEY=
```

---

## Implementation Phases

> **🎯 Calendar Integration Note:** Unlike typical implementations that add calendar as a late-stage feature, this plan integrates the calendar view directly into Phase 3 (Sessions Module). This approach, inspired by Upheal's design, provides a unified session management experience where users can seamlessly switch between list and calendar views, drag-and-drop to reschedule, and create sessions directly from the calendar.

---

### **Phase 1: Foundation & Authentication** (Week 1)

**Goal:** Set up project foundation with working authentication

**Tasks:**

1. Create Supabase project and configure database
2. Set up database schema and RLS policies
3. Configure storage buckets with policies
4. Install all required dependencies
5. Create Supabase client utilities (browser, server, middleware)
6. Build authentication pages (login, signup)
7. Implement protected routes middleware
8. Create basic dashboard layout with sidebar navigation

**Deliverables:**

- ✅ Working authentication system
- ✅ Protected dashboard routes
- ✅ Basic navigation structure

**Files to Create:**

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `middleware.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(dashboard)/dashboard/layout.tsx`
- `components/dashboard/sidebar.tsx`

---

### **Phase 2: Clients Module** (Week 1-2)

**Goal:** Complete client management system

**Tasks:**

1. Create clients table UI with shadcn DataTable
2. Implement client search and filtering
3. Build add/edit client forms with validation (react-hook-form + zod)
4. Create client profile page
5. Add client archiving functionality
6. Display session history per client
7. Implement CRUD server actions

**Deliverables:**

- ✅ Full CRUD for clients
- ✅ Searchable, filterable client directory
- ✅ Client profile with session history

**Files to Create:**

- `app/(dashboard)/dashboard/clients/page.tsx`
- `app/(dashboard)/dashboard/clients/[id]/page.tsx`
- `app/(dashboard)/dashboard/clients/new/page.tsx`
- `components/clients/client-table.tsx`
- `components/clients/client-form.tsx`
- `components/clients/client-card.tsx`
- `lib/actions/clients.ts`
- `lib/hooks/use-clients.ts`

---

### **Phase 3: Sessions Module with Calendar** (Week 2-3)

**Goal:** Complete session scheduling and management with interactive calendar

**Tasks:**

**Session Management:**

1. Create sessions list view with filters (date, client, status)
2. Build session scheduling form
3. Implement session status management (scheduled, in_progress, completed, cancelled)
4. Create session detail page structure
5. Add session notes editor (markdown support)
6. Implement session updates and cancellation
7. Add call type selection (internal vs external)

**Calendar Integration:** 8. Choose and integrate calendar library:

- **Recommended:** `react-big-calendar` (free, MIT license, easy drag-and-drop)
- **Alternative:** `@fullcalendar/react` (more features but paid for advanced options)

9. Create calendar view page alongside list view (tabs or separate routes)
10. Display sessions on calendar with color-coding by status:

- Green: scheduled
- Blue: in_progress
- Gray: completed
- Red: cancelled

11. Implement click-to-view session details from calendar
12. Add drag-and-drop to reschedule sessions (with confirmation dialog)
13. Implement double-click or button to create new session from calendar
14. Add month/week/day view switching
15. Add filter by client on calendar
16. Sync calendar changes with database in real-time
17. Add tooltips on hover showing session details

**Deliverables:**

- ✅ Sessions list with filtering
- ✅ Interactive calendar with sessions displayed
- ✅ Session scheduling from both list and calendar views
- ✅ Drag-and-drop rescheduling on calendar
- ✅ Session detail pages with notes
- ✅ Click-to-edit from calendar events

**Files to Create:**

- `app/(dashboard)/dashboard/sessions/page.tsx` (with tabs for list/calendar view)
- `app/(dashboard)/dashboard/sessions/calendar/page.tsx` (or integrated in main page)
- `app/(dashboard)/dashboard/sessions/[id]/page.tsx`
- `app/(dashboard)/dashboard/sessions/new/page.tsx`
- `components/sessions/session-table.tsx`
- `components/sessions/session-form.tsx`
- `components/sessions/call-type-selector.tsx`
- `components/sessions/session-calendar.tsx`
- `components/sessions/calendar-event.tsx`
- `components/sessions/calendar-toolbar.tsx`
- `lib/actions/sessions.ts`
- `lib/hooks/use-sessions.ts`
- `lib/hooks/use-calendar.ts`

---

### **Phase 4: Video Calling & Recording** (Week 3-4)

**Goal:** Implement video calling and audio recording

**Tasks:**

**Video Calling (Daily.co):**

1. Set up Daily.co account and API keys
2. Create Daily.co room creation API route
3. Build video call component with Daily.co React SDK
4. Add recording controls and indicators
5. Handle Daily.co recording download and storage

**Manual Recording (External Links):** 6. Implement MediaRecorder for external call scenarios 7. Build recording UI components (start/stop/pause, timer, waveform) 8. Handle microphone permissions 9. Add upload to Supabase Storage 10. Create audio player component 11. Handle recording errors gracefully

**Deliverables:**

- ✅ Working video call interface with Daily.co
- ✅ Support for external meeting links
- ✅ Audio/video recording functionality
- ✅ Recording storage in Supabase
- ✅ Playback functionality

**Files to Create:**

- `app/api/daily/create-room/route.ts`
- `app/api/sessions/[id]/process-recording/route.ts`
- `components/sessions/video-call.tsx`
- `components/sessions/audio-recorder.tsx`
- `components/sessions/audio-player.tsx`
- `lib/hooks/use-audio-recorder.ts`
- `lib/actions/upload-audio.ts`
- `lib/actions/daily-rooms.ts`

---

### **Phase 5: Transcription with Groq** (Week 4)

**Goal:** Automatic audio transcription

**Tasks:**

1. Set up Groq API account and keys
2. Install Groq SDK
3. Create Groq transcription server action
4. Implement transcription trigger on upload
5. Build transcript viewer component with timestamps
6. Add transcript editing capability
7. Display processing status indicators (pending, processing, completed, failed)
8. Handle transcription errors and retries
9. Implement chunking for large files (>25MB)
10. Test transcription speed and accuracy

**Model Selection:**

- **Production:** `whisper-large-v3` (highest accuracy)
- **Development:** `whisper-large-v3-turbo` (3x faster)

**Deliverables:**

- ✅ Ultra-fast automatic transcription using Groq
- ✅ Transcript viewer with edit capability
- ✅ Status tracking for transcription jobs
- ✅ Real-time transcription status updates

**Files to Create:**

- `app/api/sessions/transcribe/route.ts`
- `components/sessions/transcript-viewer.tsx`
- `lib/actions/transcribe-groq.ts`
- `lib/actions/chunk-transcribe.ts` (for large files)
- `lib/utils/rate-limiter.ts`

**Alternative:** Supabase Edge Function

- `supabase/functions/transcribe-groq/index.ts`

---

### **Phase 6: Home Dashboard & Analytics** (Week 5)

**Goal:** Overview dashboard with key metrics

**Tasks:**

1. Create dashboard stat cards:
   - Total clients
   - Upcoming sessions
   - This week's sessions
   - Session completion rate
2. Build activity feed component
3. Add quick action buttons (add client, schedule session, start recording)
4. Implement data aggregation queries
5. Create charts/graphs (optional)
6. Add date range filters
7. Display recent sessions

**Deliverables:**

- ✅ Complete home dashboard
- ✅ Key metrics and statistics
- ✅ Recent activity feed
- ✅ Quick actions

**Files to Create:**

- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/stats-card.tsx`
- `components/dashboard/activity-feed.tsx`
- `components/dashboard/quick-actions.tsx`
- `lib/hooks/use-dashboard-stats.ts`

---

## Session Workflows

### Workflow 1: Internal Call (Daily.co)

1. **Creation** → Therapist creates session with "Built-in Video Call"
2. **Start** → Both join Daily.co room, recording starts automatically
3. **End** → Call ends, recording downloaded and uploaded to Supabase
4. **Transcription** → Groq processes audio (~2 min for 1-hour session)
5. **Review** → Therapist reviews transcript and adds notes

### Workflow 2: External Link (Zoom/Meet)

1. **Creation** → Therapist creates session with "External Meeting Link" (from list, calendar, or dashboard)
2. **Preparation** → Opens session page, sees manual recording interface
3. **Start** → Starts local recording, joins external call
4. **End** → Stops recording, audio uploaded to Supabase
5. **Transcription** → Groq processes audio
6. **Review** → Therapist reviews transcript and adds notes

### Calendar Interaction Flow

1. **View Sessions** → Sessions appear as colored blocks on calendar (green=scheduled, blue=in_progress, gray=completed)
2. **Reschedule** → Drag session block to new time slot → Confirmation dialog → Database updates
3. **View Details** → Click on session event → Session detail modal or navigate to detail page
4. **Create Session** → Double-click empty time slot OR click "+" button → Session form opens with pre-filled date/time
5. **Filter** → Select client from dropdown → Calendar shows only that client's sessions
6. **Switch Views** → Toggle between Month/Week/Day views for different granularity

### Calendar UI/UX Best Practices (Upheal-inspired)

**Layout:**

- Use tabs or toggle to switch between "List View" and "Calendar View"
- Keep filters (client, status, date range) consistent across both views
- Show mini calendar widget for quick date navigation
- Display current date/week prominently

**Calendar Events:**

- Show client name + session type on event block
- Use consistent color coding across entire app
- Add status badge/icon on event blocks
- Display duration on event (e.g., "60 min")
- Truncate long names with ellipsis, show full on hover

**Interactions:**

- Confirm before rescheduling (prevent accidental moves)
- Show loading state during drag-and-drop
- Provide keyboard shortcuts (arrows to navigate, enter to create)
- Add "Today" button to quickly return to current date
- Enable multi-day event spanning for longer sessions

**Mobile Responsiveness:**

- Switch to list view on small screens
- Use swipe gestures for date navigation
- Make events tap-friendly (larger touch targets)
- Consider agenda view for mobile

---

## Database Schema Overview

### Tables

- `profiles` - Therapist profiles (extends auth.users)
- `clients` - Client information
- `sessions` - Session scheduling and metadata
- `recordings` - Audio files and transcripts

### Storage Buckets

- `audio-recordings` - Private bucket for session recordings

### Security

- Row Level Security (RLS) enabled on all tables
- Therapists can only access their own data
- Storage policies enforce file access control
- Signed URLs for temporary file access

**Full schema details in IMPLEMENTATION_PLAN.md**

---

## Testing Checklist

### Phase 1 - Authentication

- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] Protected routes redirect to login
- [ ] Token refresh works correctly

### Phase 2 - Clients

- [ ] Create new client
- [ ] View client list
- [ ] Search clients
- [ ] Edit client details
- [ ] Archive client
- [ ] View client profile

### Phase 3 - Sessions & Calendar

**Session Management:**

- [ ] Schedule new session
- [ ] View sessions list
- [ ] Filter sessions
- [ ] Edit session details
- [ ] Cancel session
- [ ] View session detail

**Calendar Features:**

- [ ] Sessions display on calendar
- [ ] Can create session from calendar (double-click or button)
- [ ] Drag to reschedule works
- [ ] Click event to view details
- [ ] Filters work correctly (by client)
- [ ] Multiple views work (month/week/day)
- [ ] Color-coding by status works
- [ ] Real-time sync with database

### Phase 4 - Recording

- [ ] Join Daily.co call
- [ ] Start/stop recording (Daily.co)
- [ ] Manual recording (external links)
- [ ] Upload to Supabase
- [ ] Play back recording
- [ ] Handle errors gracefully

### Phase 5 - Transcription

- [ ] Transcription triggers after upload
- [ ] Status updates correctly
- [ ] Transcript displays properly
- [ ] Can edit transcript
- [ ] Handles large files (chunking)
- [ ] Error handling works

### Phase 6 - Dashboard

- [ ] Stats display correctly
- [ ] Activity feed shows recent actions
- [ ] Quick actions work
- [ ] Data refreshes properly

---

## Deployment Checklist

### Pre-Deployment

- [ ] Set up production Supabase project
- [ ] Run database migrations
- [ ] Create storage buckets
- [ ] Apply RLS policies
- [ ] Test all environment variables

### Deployment

- [ ] Configure environment variables in Vercel
- [ ] Deploy Edge Functions to Supabase (if using)
- [ ] Deploy Next.js app to Vercel
- [ ] Test authentication flow
- [ ] Test video calling
- [ ] Test recording and transcription
- [ ] Verify RLS policies work

### Post-Deployment

- [ ] Set up error tracking
- [ ] Monitor API usage
- [ ] Test all critical paths
- [ ] Check performance metrics

---

## Cost Estimates

### Free Tier (0-50 sessions/month)

- Daily.co: ✅ Free (under 10,000 min/month)
- Groq Transcription: ✅ Free tier sufficient
- Supabase: ⚠️ Need Pro ($25/month) for storage
- **Total: ~$25/month**

### Growing Usage (50-200 sessions/month)

- Daily.co: ~$24-36/month (after free tier)
- Groq Transcription: ~$22/month
- Supabase Pro: $25/month
- **Total: ~$71-83/month**

---

## Troubleshooting Guide

### Common Issues

**Supabase client not working in server components**

- Solution: Use `createClient()` from `lib/supabase/server.ts` and await `cookies()`

**MediaRecorder not supported**

- Solution: Check browser compatibility, provide fallback UI

**Transcription takes too long**

- Solution: Use `whisper-large-v3-turbo` or implement chunking

**Storage upload fails**

- Solution: Check file size limit (25MB), verify RLS policies

**RLS policies blocking access**

- Solution: Verify `auth.uid()` is set, test with Supabase SQL Editor

**Rate limits hit on Groq**

- Solution: Implement rate limiting with queue system (see IMPLEMENTATION_PLAN.md)

---

## Project Structure

```
empath-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/dashboard/
│   │   ├── page.tsx                    # Home dashboard
│   │   ├── layout.tsx                  # Sidebar navigation
│   │   ├── sessions/
│   │   │   ├── page.tsx                # Sessions list + calendar (tabs)
│   │   │   ├── [id]/page.tsx           # Session detail
│   │   │   └── new/page.tsx            # Create session
│   │   └── clients/
│   │       ├── page.tsx                # Clients list
│   │       ├── [id]/page.tsx           # Client profile
│   │       └── new/page.tsx            # Add client
│   ├── api/
│   │   ├── daily/create-room/route.ts
│   │   ├── sessions/
│   │   │   ├── [id]/process-recording/route.ts
│   │   │   └── transcribe/route.ts
│   │   └── webhooks/transcription/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn components
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── stats-card.tsx
│   │   └── activity-feed.tsx
│   ├── sessions/
│   │   ├── video-call.tsx
│   │   ├── audio-recorder.tsx
│   │   ├── audio-player.tsx
│   │   ├── session-form.tsx
│   │   ├── session-table.tsx
│   │   ├── session-calendar.tsx        # Calendar view component
│   │   ├── calendar-event.tsx          # Individual calendar event
│   │   ├── calendar-toolbar.tsx        # Calendar controls
│   │   └── transcript-viewer.tsx
│   └── clients/
│       ├── client-form.tsx
│       ├── client-table.tsx
│       └── client-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/
│   │   ├── use-audio-recorder.ts
│   │   ├── use-clients.ts
│   │   ├── use-sessions.ts
│   │   └── use-user.ts
│   ├── actions/
│   │   ├── upload-audio.ts
│   │   ├── transcribe-groq.ts
│   │   ├── daily-rooms.ts
│   │   ├── clients.ts
│   │   └── sessions.ts
│   ├── utils.ts
│   └── types.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   └── 20240101000001_storage_policies.sql
│   └── functions/
│       └── transcribe-groq/index.ts
├── .env.local
├── middleware.ts
├── EXECUTION_PLAN.md                   # This file
├── IMPLEMENTATION_PLAN.md              # Detailed code reference
└── package.json
```

---

## Resources & Documentation

### Essential Links

- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Daily.co API Documentation](https://docs.daily.co/reference/rest-api)
- [Groq API Documentation](https://console.groq.com/docs)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### Community Support

- [Supabase Discord](https://discord.supabase.com/)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

## Success Metrics

### Week 1

- [ ] Authentication working
- [ ] Dashboard layout complete
- [ ] Clients CRUD implemented

### Week 2-3

- [ ] Sessions scheduling working (list + calendar views)
- [ ] Calendar with drag-and-drop functional
- [ ] Client management complete
- [ ] Session detail pages ready
- [ ] Can create/edit sessions from calendar

### Week 3-4

- [ ] Video calling integrated (Daily.co)
- [ ] Recording functionality working (both internal + external)
- [ ] Storage setup complete
- [ ] Audio playback working

### Week 4

- [ ] Transcription working with Groq
- [ ] Full session workflow complete (schedule → record → transcribe → review)
- [ ] Error handling in place
- [ ] Transcript viewer with edit capability

### Week 5

- [ ] Dashboard stats working
- [ ] All features integrated and polished
- [ ] Activity feed functional
- [ ] Quick actions working

### Week 5-6

- [ ] Complete testing of all workflows
- [ ] Deployment successful
- [ ] Documentation updated
- [ ] Performance optimized

---

## Key Decisions Summary

| Decision          | Choice            | Reason                                                   |
| ----------------- | ----------------- | -------------------------------------------------------- |
| **Video Calling** | Daily.co          | 10,000 free minutes, HIPAA-compliant, built-in recording |
| **Transcription** | Groq (Whisper v3) | 32x faster than OpenAI, free tier, high accuracy         |
| **Database**      | Supabase          | PostgreSQL + auth + storage + RLS in one                 |
| **Framework**     | Next.js 15        | App Router, server actions, TypeScript support           |
| **UI Components** | shadcn/ui         | Accessible, customizable, well-maintained                |

---

## Final Checklist

### Before Starting

- [ ] Read entire execution plan
- [ ] Review IMPLEMENTATION_PLAN.md for code examples
- [ ] Set up all accounts (Supabase, Daily.co, Groq)
- [ ] Prepare development environment

### During Development

- [ ] Follow phases sequentially
- [ ] Test each feature before moving to next phase
- [ ] Keep environment variables secure
- [ ] Commit code regularly
- [ ] Document any deviations from plan
- [ ] Test calendar drag-and-drop on different browsers
- [ ] Verify mobile responsiveness for calendar view
- [ ] Test timezone handling for session scheduling

### Before Deployment

- [ ] Complete all testing checklists
- [ ] Review security settings
- [ ] Test with production data
- [ ] Set up monitoring
- [ ] Prepare rollback plan

---

## What Makes This Implementation Special?

### 1. **Integrated Calendar from Day One**

Unlike typical dashboards where calendar is an afterthought, this implementation integrates calendar functionality directly into the Sessions module (Phase 3). This provides:

- Unified session management experience
- Seamless switching between list and calendar views
- Intuitive drag-and-drop rescheduling
- Create sessions directly from calendar

### 2. **Flexible Video Calling Options**

Support for both:

- **Built-in calls** via Daily.co (professional, HIPAA-compliant)
- **External links** for Zoom/Meet (familiar to clients)

### 3. **Ultra-Fast Transcription**

Using Groq API with Whisper Large v3:

- 32x faster than OpenAI
- Process 1-hour audio in ~2 minutes
- Near real-time transcription
- Free tier available

### 4. **Production-Ready Architecture**

- Row-level security (RLS) from the start
- Type-safe with TypeScript
- Server actions for secure operations
- Modern Next.js 15 App Router

### 5. **Cost-Effective**

- Start at ~$25/month for 50 sessions
- Generous free tiers for all services
- Scales affordably as you grow

---

**Good luck with your build! 🚀**

For detailed code examples, see `IMPLEMENTATION_PLAN.md`
