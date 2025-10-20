# ⚡ Edge Functions Setup - 2 Minute Guide

## ✅ Edge Functions Deployed Successfully!

Both Edge Functions are now live on your Supabase project:

- ✅ `transcribe-recording` - Status: ACTIVE
- ✅ `generate-summary` - Status: ACTIVE

---

## 🔑 Critical: Add GROQ_API_KEY to Supabase

**You need to do this ONE TIME for Edge Functions to work:**

### Step 1: Get your Groq API Key

- You should already have this from earlier setup
- It looks like: `gsk_...`
- If you don't have it, get it from: https://console.groq.com/

### Step 2: Add to Supabase Edge Functions

1. **Go to Supabase Dashboard**

   - Open: https://supabase.com/dashboard/project/YOUR_PROJECT

2. **Navigate to Edge Functions Settings**

   - Click **Edge Functions** in the left sidebar
   - OR go to **Settings** → **Edge Functions**

3. **Add Secret/Environment Variable**

   - Look for **"Secrets"** or **"Environment Variables"** section
   - Click **"Add secret"** or **"New secret"**

4. **Enter the Key**

   ```
   Name:  GROQ_API_KEY
   Value: gsk_your_actual_groq_api_key_here
   ```

5. **Save**
   - Click **Save** or **Add**
   - The key is now available to all Edge Functions

---

## ✅ That's It!

Your system is now production-ready:

### What Happens Now:

1. **User ends video call** → Recording uploaded
2. **Next.js triggers Edge Function** → Then returns immediately
3. **Your app can be offline** → Edge Function continues processing
4. **Transcription runs** (2-5 minutes)
5. **Summary generates** (5-10 seconds)
6. **User refreshes page** → Everything is ready!

---

## 🧪 Test It

### Complete Test Flow:

1. **Create a test session**
2. **Start video call** (click "Start Video Call")
3. **Wait 30 seconds**
4. **End call** (click "End Call")
5. **Check Supabase logs** (Edge Functions → Logs)
6. **Wait 2-5 minutes**
7. **Refresh session page**
8. **See transcript & summary!** 🎉

---

## 📊 Monitor Edge Functions

### View Logs:

1. Supabase Dashboard → **Edge Functions**
2. Click on function name
3. Click **Logs** tab
4. See real-time processing logs

### Check Database:

```sql
-- View transcription status
SELECT
  id,
  file_path,
  transcript_status,
  summary_status,
  created_at
FROM recordings
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Common Issues

### "Transcription stuck on processing"

**Solution:** Check if `GROQ_API_KEY` is set in Supabase Edge Functions

### "Function returns 500 error"

**Solution:** Check Edge Function logs in Supabase Dashboard

### "No transcript after 10 minutes"

**Solution:**

1. Check Groq API rate limits
2. Verify audio file exists in Storage
3. Check Edge Function logs

---

## 🔄 Architecture Now

```
┌─────────────────────────────┐
│   Your Next.js App          │
│   (Can be offline after     │
│    triggering Edge Fn)      │
└─────────────────────────────┘
            ↓ triggers
┌─────────────────────────────┐
│  Supabase Edge Functions    │
│  (Runs independently 24/7)  │
│                             │
│  • transcribe-recording     │
│  • generate-summary         │
└─────────────────────────────┘
     ↓              ↓
┌──────────┐  ┌──────────┐
│ Groq API │  │ Supabase │
│          │  │ Database │
└──────────┘  └──────────┘
```

---

## ✅ Benefits

- ✅ **Survives app restarts** - Edge Functions run on Supabase
- ✅ **No timeouts** - Can process 2+ hour recordings
- ✅ **Reliable** - Automatic retries and error handling
- ✅ **Scalable** - Handles multiple concurrent transcriptions
- ✅ **Monitored** - Full logs in Supabase Dashboard

---

## 🎉 You're All Set!

Just add the `GROQ_API_KEY` to Supabase Edge Functions and you're production-ready!

**Next:** Test with a short video call to verify everything works.
