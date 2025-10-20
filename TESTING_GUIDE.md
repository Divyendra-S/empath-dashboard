# Quick Testing Guide

## Before You Start

1. **Make sure dev server is running**:

   ```bash
   npm run dev
   ```

   Should start on http://localhost:3000 without errors

2. **Verify API keys are set** in `.env.local`:
   - `DAILY_API_KEY` - Your Daily.co API key
   - `GROQ_API_KEY` - Already configured in Supabase Edge Functions
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## Test Flow (5 minutes)

### Step 1: Go to a Session

1. Navigate to: http://localhost:3000/dashboard/sessions
2. Click on any session (or create a new one)
3. You should see the session detail page

### Step 2: Start Video Call

1. Click the **"Start Video Call"** button
2. Allow camera and microphone permissions when prompted
3. Wait 3-5 seconds for the call to connect

### Step 3: Verify Recording Started

**What you should see**:

- ✅ Your video feed appears
- ✅ Red "Recording" badge in top-right corner
- ✅ Recording timer at bottom (e.g., "Recording: 0:05")
- ✅ Large, visible control buttons with labels
- ✅ Red "End Call" button

**What to check**:

```
┌────────────────────────────────────────┐
│  [Recording]          [⛶ Full Screen]  │  ← Top controls
│                                         │
│     [Your video feed here]              │
│                                         │
│                                         │
└────────────────────────────────────────┘
│  Recording: 0:15                        │  ← Duration timer
│  [Video]  [Audio]  [End Call (RED)]    │  ← Control buttons
└────────────────────────────────────────┘
```

### Step 4: Test Controls

1. **Click Video button** - Your video should turn off/on
2. **Click Audio button** - Your mic should mute/unmute
3. **Click Full Screen** - Should go full screen
4. **Watch the timer** - Should increment every second

### Step 5: Speak for 30 Seconds

- Say something like: "This is a test recording. I'm testing the audio recording feature. The session is about anxiety management."
- This gives enough content for transcription to work

### Step 6: End the Call

1. Click the red **"End Call"** button
2. Wait for toasts to appear:
   - "Uploading recording..."
   - "Recording uploaded! Transcription started."

### Step 7: Check Recording Upload

1. You should be back on the session detail page
2. Refresh the page (F5)
3. Look for "Transcribing audio..." message
4. This means the recording was uploaded successfully!

### Step 8: Wait for Transcription (2-3 minutes)

1. Keep the session page open
2. Refresh every 30 seconds
3. After 1-2 minutes, you should see:
   - **Transcript card** with your spoken words
   - **AI Summary card** with session insights

### Step 9: Verify Complete Flow

**Checklist**:

- [ ] Recording started automatically
- [ ] Duration timer worked
- [ ] Recording indicator visible
- [ ] Upload succeeded
- [ ] Transcript appeared
- [ ] Summary appeared

## What Each Component Should Look Like

### 1. Video Call Controls (New Design)

```
Background: Dark with backdrop blur
Buttons: Large, with icons AND text labels
End Call: Bright red (bg-red-500)
```

**Before** (old):

```
[📹] [🎤] [📞 End Call]
```

**After** (new):

```
[📹 Video]  [🎤 Audio]  [📞 End Call (RED)]
      ↑           ↑            ↑
   120px       120px        140px
```

### 2. Recording Indicator (Both Users See This)

```
┌─────────────────────────────────┐
│  🔴 Recording              [⛶]  │  ← Top-right corner
│                                  │
│     [Video Feed]                 │
│                                  │
└─────────────────────────────────┘
```

### 3. Recording Status (Bottom of Controls)

```
┌────────────────────────────────┐
│  🔴 Recording: 1:23             │  ← Red badge with timer
│  [Video] [Audio] [End Call]    │
└────────────────────────────────┘
```

## Common Issues & Fixes

### Issue: "Failed to start audio recording"

**Cause**: Microphone permission denied
**Fix**:

1. Check browser permissions
2. Click the lock icon in address bar
3. Allow microphone access

### Issue: "Failed to upload recording"

**Cause**: Supabase storage not configured
**Fix**:

1. Check Supabase Storage bucket `audio-recordings` exists
2. Verify bucket permissions (should allow authenticated uploads)

### Issue: No transcript appears

**Cause**: Transcription might still be processing
**Fix**:

1. Wait 2-3 minutes (Groq API can be slow)
2. Check browser console for errors
3. Check Supabase Edge Function logs

### Issue: Buttons are still hard to see

**Cause**: Browser cache or styles not updating
**Fix**:

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private window

## Debug Checklist

If something isn't working, check these in order:

1. **Dev Server Running?**

   ```bash
   lsof -ti:3000
   ```

   Should return a process ID

2. **Console Errors?**

   - Open browser DevTools (F12)
   - Check Console tab
   - Look for red errors

3. **Network Requests?**

   - Open DevTools → Network tab
   - Look for `/api/sessions/*/upload-recording`
   - Check if it returns 200 OK

4. **Supabase Storage?**

   - Go to Supabase Dashboard
   - Storage → audio-recordings
   - Should see .webm files appearing

5. **Edge Function Logs?**
   - Supabase Dashboard → Edge Functions
   - Click `transcribe-recording`
   - Check Logs tab for errors

## Expected Timeline

| Step          | Time       | What's Happening                          |
| ------------- | ---------- | ----------------------------------------- |
| Start Call    | 3-5s       | Joining Daily.co room, starting recording |
| Recording     | Variable   | Capturing audio                           |
| End Call      | 2-5s       | Stopping recording, creating blob         |
| Upload        | 5-15s      | Sending to server, saving to Storage      |
| Transcription | 1-3min     | Groq Whisper processing audio             |
| Summary       | 30-60s     | Groq LLaMA analyzing transcript           |
| **Total**     | **2-5min** | Full end-to-end flow                      |

## Success Indicators

You know it's working when you see:

1. ✅ Call connects without errors
2. ✅ Red "Recording" badge appears
3. ✅ Timer increments (0:00, 0:01, 0:02...)
4. ✅ "Recording uploaded!" toast appears
5. ✅ "Transcribing audio..." message shows
6. ✅ Transcript appears with your spoken words
7. ✅ Summary appears with session insights

## Pro Tips

### Test with Real Content

Instead of just "testing 1 2 3", say something realistic:

```
"Hello, this is our session for today. We'll be discussing
strategies for managing workplace anxiety. The client mentioned
feeling overwhelmed during team meetings."
```

This gives the AI better content to transcribe and summarize!

### Use Two Browsers

- Open session in Chrome (therapist)
- Open client join link in Firefox (client)
- Both should see "Recording" indicator
- Tests the full experience

### Check File Size

After upload, check Supabase Storage:

- File should be 1-5 MB for a 1-minute recording
- If 0 bytes, recording failed
- If > 10 MB, consider compression

---

**Ready to test?** Start with Step 1 and go through each step carefully! 🚀
