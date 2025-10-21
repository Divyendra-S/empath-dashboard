# 🚀 Quick Start Guide: Video Calls & AI Features

## ✅ What's Ready

Your Empath Dashboard now has **full video calling, recording, transcription, and AI summary capabilities**!

All code is implemented and ready to use. You just need to add two API keys.

---

## 📋 Setup Checklist (5 minutes)

### 1. Get Daily.co API Key (2 minutes)

Daily.co provides the video calling infrastructure:

1. Visit https://dashboard.daily.co/signup
2. Sign up for a free account (10,000 minutes/month free)
3. After login, go to **Developers** → **API Keys**
4. Copy your API key

### 2. Get Groq API Key (2 minutes)

Groq provides lightning-fast AI transcription and summaries:

1. Visit https://console.groq.com/
2. Sign up for a free account
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key

### 3. Add Keys to .env.local (1 minute)

Create or update your `.env.local` file in the project root:

```env
# Your existing Supabase keys (already set)
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here

# NEW: Add these two keys
DAILY_API_KEY=your-daily-api-key-here
GROQ_API_KEY=your-groq-api-key-here

# Optional (defaults to localhost:3000 if not set)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Restart Dev Server

```bash
npm run dev
```

---

## 🎬 Test the Complete Flow (5 minutes)

### Step 1: Create a Test Session

1. Go to **Dashboard** → **Sessions** → **New Session**
2. Select any client
3. Set date/time (can be past or future)
4. Save the session

### Step 2: Start a Video Call

1. Open the session detail page
2. Click **"Start Video Call"** button
3. Allow camera/microphone permissions when prompted
4. You should see yourself in the video call!

### Step 3: Test Video Controls

- Toggle video on/off
- Toggle audio on/off
- Notice the "Recording" indicator (red dot)

### Step 4: End the Call

1. Click **"End Call"** button
2. Session status changes to "completed"
3. Recording starts processing

### Step 5: Watch the Magic Happen ✨

The system automatically:

1. **Downloads recording** from Daily.co (30 seconds)
2. **Uploads to Supabase** Storage (few seconds)
3. **Transcribes with Groq Whisper** (2-5 minutes for typical session)
4. **Generates AI Summary** (5-10 seconds after transcription)

**Refresh the page** to see updates!

### Step 6: Review Everything

Once processing completes, you'll see:

- ✅ **Audio Player** with playback controls
- ✅ **Full Transcript** (editable!)
- ✅ **AI Summary** with key insights

---

## 🎯 What Each Component Does

### Video Call Component

- Real-time video/audio communication
- Built-in cloud recording (automatic)
- Toggle controls for video/audio
- Professional UI with recording indicator

### Audio Player

- Play/pause controls
- Seek bar for navigation
- Volume control
- Playback speed (0.5x to 2x)
- Download button
- Skip forward/backward (10 seconds)

### Transcript Viewer

- Full AI-generated transcript
- Edit and save capabilities
- Copy to clipboard
- Clean, readable format

### AI Summary

- Key themes and insights
- Client's emotional state
- Action items
- Session highlights
- Regenerate option

---

## 🔍 Troubleshooting

### "Failed to create room"

- Check that `DAILY_API_KEY` is set correctly in `.env.local`
- Verify you've restarted the dev server after adding the key
- Check Daily.co dashboard to ensure account is active

### "Recording not appearing"

- Wait 30-60 seconds after ending call
- Refresh the session detail page
- Check browser console for errors
- Verify Supabase Storage permissions

### "Transcription stuck on 'processing'"

- Check that `GROQ_API_KEY` is set correctly
- Typical transcription time: 2-5 minutes for 30-60 min session
- Check server terminal for error messages
- Verify Groq API rate limits aren't exceeded

### Camera/Microphone not working

- Ensure browser permissions are granted
- Check that no other app is using camera/mic
- Try a different browser if issues persist

---

## 💡 Pro Tips

1. **Test with short sessions first** - End the call after 30 seconds to test the full flow quickly
2. **Monitor the terminal** - Watch server logs for processing updates
3. **Use playback speed** - Review sessions faster with 1.5x or 2x speed
4. **Edit transcripts** - Fix any AI transcription errors before generating summaries
5. **Regenerate summaries** - If summary isn't detailed enough, click regenerate

---

## 📊 System Architecture

```
User clicks "Start Video Call"
    ↓
Daily.co room created (API)
    ↓
Video call with cloud recording
    ↓
User ends call
    ↓
Recording saved to Daily.co cloud
    ↓
Webhook downloads recording
    ↓
Uploaded to Supabase Storage
    ↓
Groq Whisper transcribes audio
    ↓
Transcript saved to database
    ↓
Groq LLaMA generates summary
    ↓
Summary saved to database
    ↓
All available in session detail page!
```

---

## 🎨 UI Features

- **Modern Design**: Rounded corners, subtle shadows, purple accents
- **Loading States**: Spinners and progress indicators
- **Error Handling**: Clear error messages with retry options
- **Responsive**: Works on desktop and tablet
- **Accessible**: Proper ARIA labels and keyboard navigation

---

## 🔒 Security & Privacy

- ✅ All recordings stored securely in Supabase
- ✅ Row-level security (RLS) ensures data isolation
- ✅ Daily.co rooms expire after 2 hours
- ✅ Private rooms (not publicly accessible)
- ✅ Only therapist can access their recordings

---

## 📈 Free Tier Limits

### Daily.co Free Tier

- 10,000 minutes/month
- That's ~166 hours of video calls!
- Cloud recording included
- No credit card required

### Groq Free Tier

- Generous rate limits
- Fast processing (~30x faster than real-time)
- Both Whisper and LLaMA included
- No credit card required initially

---

## 🎉 You're All Set!

Everything is implemented and ready to go. Just add your API keys and start testing!

**Need Help?**

- Check `IMPLEMENTATION_COMPLETE.md` for detailed documentation
- Review server logs in terminal for debugging
- Supabase advisors show only minor optimization suggestions

**Happy Therapy Sessions! 🧠💜**
