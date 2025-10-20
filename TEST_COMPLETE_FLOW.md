# 🧪 Complete Flow Test Guide

## ✅ Setup Complete!

- ✅ Edge Functions deployed
- ✅ GROQ_API_KEY added to Supabase
- ✅ Next.js code updated

Now let's test everything!

---

## 🎬 End-to-End Test (5 minutes)

### Step 1: Start Your App

```bash
npm run dev
```

Visit: http://localhost:3000

---

### Step 2: Create a Test Session

1. **Go to Sessions**:

   - Click "Dashboard" → "Sessions"
   - Or go to: http://localhost:3000/dashboard/sessions

2. **Create New Session**:
   - Click "New Session" button
   - Select any client (or create a test client first)
   - Set date/time to current time
   - Duration: 30 minutes
   - Click "Create Session"

---

### Step 3: Start Video Call

1. **Open the Session**:

   - Click on the session you just created

2. **Start Video Call**:

   - Click the **"Start Video Call"** button
   - Allow camera/microphone permissions
   - You should see yourself in the video!

3. **Verify Recording Indicator**:
   - Look for red "Recording" badge in top-right of video
   - This means cloud recording is active ✅

---

### Step 4: End Call (After 30 Seconds)

1. **Click "End Call"** button
2. Session status changes to "Completed"
3. You're redirected to session detail page

---

### Step 5: Watch the Magic! ✨

**What happens automatically:**

1. **Immediate** (0-30 seconds):

   - Recording downloads from Daily.co
   - Uploads to Supabase Storage
   - Edge Function triggered

2. **Processing** (2-5 minutes):

   - Groq Whisper transcribes audio
   - Status shows "Transcribing audio..."

3. **Summary** (5-10 seconds after transcript):
   - Groq LLaMA generates AI summary
   - Both appear on the page!

**Keep refreshing the session detail page every 30 seconds to see progress!**

---

## 📊 Monitor Progress

### Option 1: Check Supabase Logs

1. **Open Supabase Dashboard**:

   - Go to: https://supabase.com/dashboard/project/ofzicxdmlezuwipdjzfn/functions

2. **View Transcription Logs**:

   - Click **"transcribe-recording"**
   - Click **"Logs"** tab
   - Watch real-time processing!

3. **View Summary Logs**:
   - Click **"generate-summary"**
   - Click **"Logs"** tab
   - See summary generation!

### Option 2: Check Database Directly

```sql
-- Run in Supabase SQL Editor
SELECT
  id,
  file_path,
  transcript_status,
  summary_status,
  created_at,
  LENGTH(transcript) as transcript_length,
  LENGTH(summary) as summary_length
FROM recordings
ORDER BY created_at DESC
LIMIT 5;
```

You should see status progression:

- `transcript_status`: pending → processing → completed
- `summary_status`: pending → processing → completed

---

## ✅ Expected Results

### After Call Ends (~30 seconds):

- ✅ Audio player visible
- ✅ "Transcribing audio..." message

### After 2-5 Minutes:

- ✅ Full transcript appears
- ✅ "Generating AI summary..." message

### After 5-10 More Seconds:

- ✅ AI summary appears with:
  - Brief overview
  - Key themes
  - Emotional state
  - Action items
  - Insights

---

## 🎯 What You Should See

### Session Detail Page Will Show:

1. **Audio Player** 🎵

   - Play/pause button
   - Seek bar
   - Volume control
   - Speed control (0.5x, 1x, 1.5x, 2x)
   - Download button

2. **Transcript Viewer** 📝

   - Full text transcript
   - Edit button (to fix errors)
   - Copy to clipboard button
   - Save changes

3. **AI Summary** ✨
   - Professional therapeutic summary
   - Key insights
   - Copy button
   - Regenerate button

---

## 🚨 Troubleshooting

### Transcript Still "Processing" After 10 Minutes

**Check Edge Function Logs:**

1. Go to Supabase Dashboard → Edge Functions
2. Click "transcribe-recording" → Logs
3. Look for error messages

**Common Issues:**

- ❌ "GROQ_API_KEY not configured" → Re-add key to Supabase
- ❌ "Failed to download audio" → Check Supabase Storage
- ❌ "Groq API error" → Check Groq API rate limits

### No Recording After Call Ends

**Check:**

1. Browser console for errors
2. Daily.co recording was enabled (red dot during call)
3. `process-recording` API route logs

### Summary Not Generating

**Check:**

1. Transcript must exist first
2. Edge Function logs for errors
3. `summary_status` in database

---

## 🎉 Success Criteria

Your system is working if:

- ✅ Video call connects and shows recording indicator
- ✅ Audio player appears after call ends
- ✅ Transcript generates within 5 minutes
- ✅ Summary appears after transcript
- ✅ All controls work (play, pause, edit, etc.)

---

## 🔄 Test Different Scenarios

### Test 1: Short Call (30 seconds)

- Quick test of basic functionality
- Transcription should be nearly instant

### Test 2: Longer Call (2-3 minutes)

- Talk during the call
- Verify quality of transcription
- Check summary accuracy

### Test 3: App Restart Test

1. Start call → End call
2. **Stop your Next.js app** (npm dev server)
3. Wait 3 minutes
4. **Start app again**
5. Check session → Transcript should be there! ✅
   - This proves Edge Functions work independently!

---

## 📝 Notes

### Processing Times (Approximate):

- **Recording Upload**: 10-30 seconds
- **Transcription**: 2-5 minutes (for 30-60 min session)
- **Summary**: 5-10 seconds

### Groq Free Tier Limits:

- Check: https://console.groq.com/
- Monitor your usage
- Upgrade if needed for production

### Daily.co Free Tier:

- 10,000 minutes/month
- ~166 hours of calls
- Perfect for testing and small practices

---

## 🎊 Congratulations!

If everything works, you now have:

- ✅ Professional video calling system
- ✅ Automatic cloud recording
- ✅ AI-powered transcription
- ✅ Intelligent session summaries
- ✅ Production-ready architecture
- ✅ Survives app restarts

**Your therapy practice dashboard is complete!** 🚀

---

## 📚 Next Steps

1. **Test thoroughly** with different scenarios
2. **Monitor Groq usage** for rate limits
3. **Set up production deployment** (Vercel recommended)
4. **Configure custom domain**
5. **Add more clients and sessions**
6. **Consider HIPAA compliance** for production

---

## 🆘 Need Help?

Check these files:

- `EDGE_FUNCTIONS_ARCHITECTURE.md` - Technical details
- `SETUP_EDGE_FUNCTIONS.md` - Setup guide
- `IMPLEMENTATION_COMPLETE.md` - Full implementation docs

Or check logs:

- Supabase Dashboard → Edge Functions → Logs
- Browser Console (F12)
- Terminal where npm dev is running
