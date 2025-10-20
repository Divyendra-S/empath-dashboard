# 📸 Visual Test Guide - What You'll See

## 🎬 Complete Flow with Screenshots

### Step 1: Session Page (Before Starting Call)

```
URL: http://localhost:3000/dashboard/sessions/c818c303-f3bb-429b-8e51-a3b47669f483

You'll see:
┌─────────────────────────────────────────┐
│ ← Session with John Doe                 │
│                                          │
│ Session Information                      │
│ ├─ Client: John Doe                     │
│ ├─ Date: December 20, 2024              │
│ └─ Time: 2:00 PM                        │
│                                          │
│ Quick Actions                            │
│ ├─ [✓ Mark Complete]                    │
│ ├─ [▶️ Start Video Call]  ← CLICK THIS │
│ └─ [✏️ Edit Session]                    │
└─────────────────────────────────────────┘
```

### Step 2: Click "Start Video Call" Button

**What happens:**

1. ✅ Room is created on Daily.co
2. ✅ Session status changes to "In Progress"
3. ✅ Video call component loads
4. ✅ Browser asks for camera/mic permissions

**Browser prompt:**

```
┌────────────────────────────────────┐
│ localhost:3000 wants to:           │
│                                    │
│ ● Use your camera                  │
│ ● Use your microphone              │
│                                    │
│   [Block]        [Allow] ← CLICK   │
└────────────────────────────────────┘
```

### Step 3: After Allowing Camera/Mic

```
┌──────────────────────────────────────────────────┐
│ Client Join Link                        [Purple] │
│ Share this link with your client                 │
│                                                   │
│ ┌────────────────────────────┐  ┌──────────┐   │
│ │ http://localhost:3000/...  │  │ 📋 Copy  │   │
│ └────────────────────────────┘  └──────────┘   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Video Call                  🔴 Recording    [⛶]  │
│ Your session is being recorded automatically     │
│                                                   │
│ ┌────────────────────────────────────────────┐  │
│ │                                            │  │
│ │              YOUR VIDEO FEED               │  │
│ │          (You see yourself here)           │  │
│ │                                            │  │
│ └────────────────────────────────────────────┘  │
│                                                   │
│            [📹]    [🎤]    [📞 End Call]         │
└──────────────────────────────────────────────────┘
```

**Key elements:**

- 🔴 Recording indicator (top-right) - May not show if on free plan
- [⛶] Maximize button (top-left) - Click for full screen
- Your video feed - Should see yourself clearly ✅
- Controls at bottom - Toggle camera, mic, or end call

### Step 4: Copy Client Link

**Click "Copy" button:**

```
┌────────────────────────┐
│ ✅ Link copied!        │
│ Send this to client... │
└────────────────────────┘
```

**Link format:**

```
http://localhost:3000/join/c818c303-f3bb-429b-8e51-a3b47669f483
```

### Step 5: Client Opens Link (Incognito Window)

**Press:** `Cmd+Shift+N` (Mac) or `Ctrl+Shift+N` (Windows) for incognito

**Paste link, client sees:**

```
┌─────────────────────────────────────────┐
│                                          │
│           🎥                             │
│                                          │
│        Join Therapy Session              │
│    Your therapist is waiting for you     │
│                                          │
│    Your Name                             │
│    ┌─────────────────────────┐          │
│    │ Enter your name...      │          │
│    └─────────────────────────┘          │
│                                          │
│    ┌─────────────────────────┐          │
│    │     Join Session        │          │
│    └─────────────────────────┘          │
│                                          │
│    By joining, you allow camera and      │
│    microphone access                     │
└─────────────────────────────────────────┘
```

### Step 6: Client Enters Name and Joins

**Client types:** "Sarah (Test Client)"  
**Client clicks:** "Join Session"

**Browser prompt for client:**

```
┌────────────────────────────────────┐
│ localhost:3000 wants to:           │
│                                    │
│ ● Use your camera                  │
│ ● Use your microphone              │
│                                    │
│   [Block]        [Allow] ← CLICK   │
└────────────────────────────────────┘
```

### Step 7: Both Connected! 🎉

**Therapist View:**

```
┌──────────────────────────────────────────────────┐
│ Video Call                  🔴 Recording    [⛶]  │
│                                                   │
│ ┌──────────────────┬─────────────────────────┐  │
│ │                  │                         │  │
│ │   YOUR VIDEO     │    CLIENT VIDEO         │  │
│ │   (You)          │    (Sarah Test Client)  │  │
│ │                  │                         │  │
│ └──────────────────┴─────────────────────────┘  │
│                                                   │
│            [📹]    [🎤]    [📞 End Call]         │
└──────────────────────────────────────────────────┘
```

**Client View (Full Screen):**

```
Full Browser Window:

 [⛶]

┌──────────────────────────────────────────────────┐
│                                                   │
│               THERAPIST VIDEO                     │
│               (Large)                             │
│                                                   │
│  ┌────────────┐                                  │
│  │ YOUR VIDEO │                                  │
│  │  (Small)   │                                  │
│  └────────────┘                                  │
│                                                   │
│            [📹]    [🎤]    [📞 End Call]         │
└──────────────────────────────────────────────────┘
```

---

## 🧪 Quick Test Checklist

### ✅ Test 1: Therapist Video

- [ ] Go to session page
- [ ] Click "Start Video Call"
- [ ] Allow camera/mic permissions
- [ ] **See yourself on camera** ✅
- [ ] Controls appear (mic, camera, end call)
- [ ] Maximize button visible

### ✅ Test 2: Client Join Link

- [ ] Client join link appears
- [ ] Click "Copy" button
- [ ] Toast notification: "Link copied!"
- [ ] Link format correct: `/join/[session-id]`

### ✅ Test 3: Client Can Join

- [ ] Open incognito window
- [ ] Paste client link
- [ ] See join page with name entry
- [ ] Enter name
- [ ] Click "Join Session"
- [ ] Allow camera/mic
- [ ] **See therapist video** ✅

### ✅ Test 4: Both See Each Other

- [ ] Therapist window: See 2 videos (you + client)
- [ ] Client window: See 2 videos (therapist + you)
- [ ] Can toggle camera on/off
- [ ] Can toggle mic on/off
- [ ] Full screen works

---

## 🎨 What If You See This?

### Scenario A: "Joining call..." (Loading Forever)

**Cause:** Permission issues or Daily.co error  
**Fix:**

1. Check browser console (F12)
2. Look for error messages
3. Try different browser
4. Check Daily.co account status

### Scenario B: Black Screen (Should be FIXED!)

**Cause:** Video tracks not loading  
**Fix:**

1. This is now fixed in the code! ✅
2. If still happening, refresh page
3. Check camera permissions
4. Try different browser

### Scenario C: "Session not found" (Client side)

**Cause:** Video call not started yet  
**Fix:**

1. Therapist must start video call first
2. Then share the link
3. Link only works when session is "in_progress"

### Scenario D: Can't Copy Link

**Cause:** Browser clipboard access  
**Fix:**

1. Make sure site is HTTPS (or localhost)
2. Check browser permissions
3. Manually select and copy text

---

## 📱 Mobile Testing

### iPhone/iPad:

```
Safari:
1. Therapist starts call on computer
2. Open link on iPhone Safari
3. Enter name
4. Join → Full screen video ✅

Note: Must use Safari on iOS!
```

### Android:

```
Chrome:
1. Therapist starts call on computer
2. Open link on Android Chrome
3. Enter name
4. Join → Full screen video ✅

Note: Chrome or Firefox work best!
```

---

## 🔍 Console Logs (What's Normal?)

### Good Console Output:

```
⏳ Daily object not ready yet...
🎥 Starting to join Daily.co room: https://...
📞 Attempting to join call...
✅ Join successful! {participants: {...}}
🔴 Attempting to start recording...
ℹ️ Recording not available (requires Daily.co Developer plan)
```

### Bad Console Output:

```
❌ Failed to join call: [error message]
→ Check Daily.co account
→ Check room creation
→ Check permissions
```

---

## 🎯 Success Criteria

### ✅ You know it's working when:

1. **Therapist View:**

   - ✅ See yourself clearly on camera
   - ✅ Client join link visible and copiable
   - ✅ Controls work (toggle camera/mic)
   - ✅ Maximize button works

2. **Client View:**

   - ✅ Join page loads
   - ✅ Name entry works
   - ✅ Can join session
   - ✅ See therapist video
   - ✅ Full screen video

3. **Both Together:**
   - ✅ See each other's video
   - ✅ Hear each other's audio
   - ✅ Can toggle camera/mic
   - ✅ Can end call gracefully

---

## 🎉 Ready to Test!

**Your dev server is running on:** `http://localhost:3000`

**Test URL:**

```
http://localhost:3000/dashboard/sessions/c818c303-f3bb-429b-8e51-a3b47669f483
```

**Follow the steps above and everything should work! 🚀**

---

## 💡 Pro Tips

1. **Use two windows side-by-side** to see both views
2. **Test with real friend** for best experience
3. **Check browser console** if any issues
4. **Grant permissions immediately** when prompted
5. **Use good lighting** for better video quality

---

**Everything is set up and ready! Start testing now! 🎬**
