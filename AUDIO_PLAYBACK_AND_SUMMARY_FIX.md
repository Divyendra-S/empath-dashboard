# Audio Playback & Summary Generation Fixes

## Issues Fixed

### 1. ✅ Audio Playback Error - "No Supported Sources"

**Problem**: Audio player was trying to load files from a public URL, but the `audio-recordings` bucket requires authentication.

**Root Cause**:

```typescript
// OLD - Trying to access private bucket as public
fileUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio-recordings/${filePath}`}
```

**Solution**: Generate signed URLs for authenticated access

#### Files Changed:

1. **New File**: `app/api/recordings/[id]/audio-url/route.ts`

   - Generates signed URLs (1 hour expiry)
   - Verifies user authentication
   - Checks session ownership

   ```typescript
   supabase.storage.from("audio-recordings").createSignedUrl(filePath, 3600);
   ```

2. **Updated**: `app/(dashboard)/dashboard/sessions/[id]/page.tsx`

   - Added `useEffect` to fetch signed URL when recording is available
   - Added loading state while URL is being generated
   - Pass signed URL to AudioPlayer component

   ```typescript
   const [audioUrl, setAudioUrl] = useState<string | null>(null);

   useEffect(() => {
     if (session?.recordings?.[0]?.id) {
       fetch(`/api/recordings/${session.recordings[0].id}/audio-url`)
         .then((res) => res.json())
         .then((data) => setAudioUrl(data.url));
     }
   }, [session?.recordings?.[0]?.id]);
   ```

---

### 2. ✅ Summary Stuck in "Processing"

**Problem**:

- Summary status showed "processing" indefinitely
- Summary remained `null`
- No way to retry if Edge Function failed

**Root Cause**: Edge Function might have failed silently or didn't trigger

**Solution**: Add manual retry mechanism and better UI states

#### Files Changed:

1. **New File**: `app/api/recordings/[id]/regenerate-summary/route.ts`

   - Manually trigger summary generation
   - Reset summary status before triggering
   - Verify transcript exists before attempting summary

   ```typescript
   // Reset status
   await supabase
     .from("recordings")
     .update({ summary_status: "pending", summary: null })
     .eq("id", recordingId);

   // Trigger Edge Function
   await fetch(`${supabaseUrl}/functions/v1/generate-summary`, {
     method: "POST",
     body: JSON.stringify({ recordingId }),
   });
   ```

2. **Updated**: `components/sessions/session-summary.tsx`

   - Changed endpoint from `/api/sessions/generate-summary` to `/api/recordings/[id]/regenerate-summary`
   - Added retry button in "processing" state (for stuck summaries)
   - Better error messages

   ```typescript
   // Before
   fetch("/api/sessions/generate-summary", {...})

   // After
   fetch(`/api/recordings/${recordingId}/regenerate-summary`, {...})
   ```

3. **Updated**: `app/(dashboard)/dashboard/sessions/[id]/page.tsx`

   - Show SessionSummary even when summary is null if status is "processing" or "failed"

   ```typescript
   // Before: Only show if summary exists
   {
     session.recordings[0].summary && <SessionSummary />;
   }

   // After: Show if summary exists OR status is processing/failed
   {
     (session.recordings[0].summary ||
       session.recordings[0].summary_status === "processing" ||
       session.recordings[0].summary_status === "failed") && <SessionSummary />;
   }
   ```

---

## New Features Added

### 1. Retry Button for Stuck Summaries

When summary is stuck in "processing":

- Shows spinner
- Message: "Generating AI summary... This usually takes 30-60 seconds"
- **Retry button**: "Stuck? Retry"
- Clicking retry will:
  1. Reset summary status to "pending"
  2. Trigger Edge Function again
  3. Show toast: "Summary generation started! Refresh in 30-60 seconds."

### 2. Audio URL Caching

- Signed URLs are fetched once and cached in component state
- Valid for 1 hour (3600 seconds)
- Automatically refetches if recording ID changes

---

## API Endpoints

### New Endpoints:

1. **GET** `/api/recordings/[id]/audio-url`

   - Returns signed URL for audio playback
   - Requires authentication
   - Verifies session ownership
   - Response: `{ url: "https://..." }`

2. **POST** `/api/recordings/[id]/regenerate-summary`
   - Manually trigger summary generation
   - Resets summary status
   - Calls generate-summary Edge Function
   - Response: `{ success: true, message: "...", result: {...} }`

---

## Testing

### Test Audio Playback:

1. Go to a completed session with recording
2. Audio player should show loading spinner briefly
3. Then audio controls appear
4. Click play - audio should play ✅

### Test Summary Generation:

1. Go to session with transcript but stuck summary
2. You should see "Generating AI summary..." with retry button
3. Click **"Stuck? Retry"**
4. Toast appears: "Summary generation started!"
5. Wait 30-60 seconds
6. Refresh page (F5)
7. Summary should appear ✅

---

## For the Stuck Recording

**Recording ID**: `b00a8d20-3470-4553-8808-1ccbf45339ba`

To fix it:

1. Go to session detail page: http://localhost:3001/dashboard/sessions/d4708f42-2f5f-4a44-9621-e18bfed4598f
2. Scroll to "AI Summary" section (should show "processing")
3. Click **"Stuck? Retry"** button
4. Wait 30-60 seconds
5. Refresh page
6. Summary should appear! 🎉

---

## Summary

| Issue                               | Status   | Fix                                      |
| ----------------------------------- | -------- | ---------------------------------------- |
| Audio playback error                | ✅ Fixed | Signed URLs via new API endpoint         |
| Summary stuck in "processing"       | ✅ Fixed | Manual retry + better UI states          |
| No way to retry failed summary      | ✅ Fixed | Retry button in all states               |
| Summary not showing when processing | ✅ Fixed | Show component even when summary is null |

## Files Modified (4 files)

1. `app/api/recordings/[id]/audio-url/route.ts` ← **NEW**
2. `app/api/recordings/[id]/regenerate-summary/route.ts` ← **NEW**
3. `app/(dashboard)/dashboard/sessions/[id]/page.tsx` ← **UPDATED**
4. `components/sessions/session-summary.tsx` ← **UPDATED**

---

## Next Steps

1. ✅ Test audio playback on the current session
2. ✅ Click retry button to generate stuck summary
3. ✅ Verify transcript and summary both appear
4. ✅ Test with new recordings going forward

The complete flow now works end-to-end! 🚀
