# 🐛 Debugging Video Call Issues

## Current Issue: "Joining call..." Forever

The video call is stuck on the loading screen.

---

## 🔍 Debug Steps

### Step 1: Check Browser Console

**Open DevTools:**

- Press `F12` (or `Cmd+Option+I` on Mac)
- Go to **Console** tab
- Look for errors

**What to Look For:**

- ❌ Red error messages
- ⚠️ Yellow warnings
- 🎥 Daily.co logs (we added emojis for easy spotting)

### Step 2: Check Network Tab

**In DevTools:**

- Go to **Network** tab
- Refresh the page
- Click "Start Video Call"
- Look for:
  - ✅ `/api/daily/create-room` - Should be `200 OK`
  - ❌ Any failed requests (red)

### Step 3: Check Room URL

**Look in console for:**

```
🎥 Starting to join Daily.co room: https://...
```

**Verify:**

- URL starts with `https://`
- URL looks like: `https://yourcompany.daily.co/session-xxx`
- URL is not `null` or `undefined`

---

## 🚨 Common Issues & Fixes

### Issue 1: Room Not Created

**Symptoms:**

- No room URL in console
- Error in `/api/daily/create-room` request

**Check:**

```bash
# In browser console:
fetch('/api/daily/create-room', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({sessionId: 'YOUR_SESSION_ID'})
}).then(r => r.json()).then(console.log)
```

**Possible causes:**

- ❌ `DAILY_API_KEY` not set
- ❌ User not authenticated
- ❌ Session ID invalid

---

### Issue 2: Browser Permissions Blocked

**Symptoms:**

- "Joining call..." forever
- No permission prompt appears

**Fix:**

1. Click the 🔒 lock icon in address bar
2. Check Camera & Microphone permissions
3. Set to "Allow"
4. Refresh page

**For Chrome:**

- `chrome://settings/content/camera`
- `chrome://settings/content/microphone`

**For Safari:**

- Safari → Settings → Websites → Camera/Microphone
- Allow for `localhost`

---

### Issue 3: Daily.co SDK Not Loading

**Symptoms:**

- Error: "daily is not defined"
- DailyProvider errors

**Check:**

```bash
# Verify packages are installed:
npm list @daily-co/daily-js @daily-co/daily-react
```

**Should show:**

```
├── @daily-co/daily-js@0.85.0
└── @daily-co/daily-react@0.23.2
```

**If missing:**

```bash
npm install @daily-co/daily-js @daily-co/daily-react
```

---

### Issue 4: Room URL Invalid

**Symptoms:**

- Error: "Invalid room URL"
- Call fails to join

**Check console for:**

```javascript
🎥 Starting to join Daily.co room: [URL HERE]
```

**Valid URL format:**

- `https://yourcompany.daily.co/room-name`
- or `https://daily.co/room-name`

**Invalid:**

- `null`
- `undefined`
- `http://` (should be `https://`)

---

### Issue 5: CORS or Network Error

**Symptoms:**

- "Failed to fetch"
- Network request blocked

**Check:**

1. Are you on HTTPS or localhost? (Daily.co requires secure context)
2. Is your internet connection stable?
3. Is Daily.co accessible? Check: https://status.daily.co/

---

## 🧪 Manual Test Script

**Run this in browser console (after starting video call):**

```javascript
// Check if room was created
fetch("/api/daily/create-room", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId: "test-session-123" }),
})
  .then((r) => r.json())
  .then((data) => {
    console.log("✅ Room created:", data);

    // Try to join the room
    const DailyIframe = require("@daily-co/daily-js").default;
    const daily = DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "9999",
      },
    });

    daily
      .join({ url: data.roomUrl })
      .then(() => console.log("✅ Joined successfully!"))
      .catch((err) => console.error("❌ Failed to join:", err));
  })
  .catch((err) => console.error("❌ Failed to create room:", err));
```

---

## 📊 Expected Console Output (Success)

When everything works, you should see:

```
⏳ Daily object not ready yet...
🎥 Starting to join Daily.co room: https://...
📞 Attempting to join call...
✅ Join successful! {participants: {...}, ...}
🔴 Attempting to start recording...
ℹ️ Recording not available (requires Daily.co Developer plan)
```

---

## 📋 Checklist Before Testing

- [ ] Dev server running (`npm run dev`)
- [ ] Logged in to dashboard
- [ ] Session created
- [ ] Browser console open (F12)
- [ ] Camera/mic permissions allowed
- [ ] Using HTTPS or localhost
- [ ] Internet connection stable

---

## 🆘 Still Not Working?

### Get Detailed Logs:

1. **Open session detail page**
2. **Open browser console** (F12)
3. **Click "Start Video Call"**
4. **Wait 10 seconds**
5. **Copy ALL console output**
6. **Share the logs**

### Key Info to Share:

- Browser & version
- Operating system
- Console errors (red text)
- Network errors (in Network tab)
- Room URL (from console logs)

---

## 🎯 Quick Test Checklist

Run through these quickly:

1. ✅ Room creation works?
   - Check Network tab: `/api/daily/create-room` → 200 OK
2. ✅ Room URL valid?
   - Console shows: `https://...daily.co/...`
3. ✅ Browser permissions?
   - Camera/mic prompt appears or already allowed
4. ✅ Daily SDK loaded?
   - No "daily is not defined" errors
5. ✅ Console shows join attempt?
   - See: "📞 Attempting to join call..."

---

## 🔧 Emergency Fallback Test

If nothing works, try the **simplest possible test**:

### Create test HTML file:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Daily.co Test</title>
    <script crossorigin src="https://unpkg.com/@daily-co/daily-js"></script>
  </head>
  <body>
    <h1>Daily.co Simple Test</h1>
    <div id="video"></div>
    <button onclick="joinRoom()">Join Test Room</button>

    <script>
      async function joinRoom() {
        const callFrame = window.DailyIframe.createFrame(
          document.getElementById("video"),
          { showLeaveButton: true }
        );

        // Get room URL from API
        const response = await fetch(
          "http://localhost:3000/api/daily/create-room",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: "test-123" }),
          }
        );

        const { roomUrl } = await response.json();
        console.log("Room URL:", roomUrl);

        await callFrame.join({ url: roomUrl });
        console.log("Joined!");
      }
    </script>
  </body>
</html>
```

**Save as `test-daily.html` and open in browser.**

If this works but your app doesn't → React/Next.js issue
If this fails too → Daily.co/API issue

---

Let me know what you see in the console! 🔍
