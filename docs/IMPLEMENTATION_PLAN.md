# Empath Dashboard - Implementation Plan

> **📋 Looking for the quick execution plan?** Check out [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) for a concise, phase-by-phase guide without code examples.
>
> This file contains detailed code examples and implementation references.

## Project Overview

Building a therapist dashboard inspired by Upheal with focus on core session management features: client management, calendar scheduling, session recording with audio transcription, and session history.

---

## Tech Stack

### Frontend

- **Next.js 15** (App Router with Turbopack)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend & Services

- **Supabase**
  - PostgreSQL Database
  - Authentication (Email/Password + OAuth)
  - Storage (Audio files)
  - Row Level Security (RLS)
  - Realtime subscriptions

### Video Calling & Recording

- **Built-in Calls**: Daily.co API
  - Free tier: 10,000 minutes/month
  - Cloud recording built-in
  - HIPAA-compliant option available
  - React SDK integration
- **External Links**: Support for Zoom/Meet links with local recording
  - MediaRecorder API for manual recording
  - User-side audio capture

### Audio & Transcription

- **Recording**: MediaRecorder API (browser native) + Daily.co cloud recording
- **Storage**: Supabase Storage buckets
- **Transcription**: Groq API (Whisper Models)
  - **Models Available**:
    - `whisper-large-v3` - High accuracy, multilingual support
    - `whisper-large-v3-turbo` - 2-3x faster processing, optimized speed
  - **Why Groq**: Ultra-fast inference (32x faster than OpenAI), free tier available
  - **Cost**: Free tier (25MB file limit), Dev tier (100MB limit), then ~$0.111/hour ($0.00185/min)
  - **Speed**: Near real-time transcription (processes 1 hour audio in ~2 minutes with standard model, ~30 seconds with turbo)
  - **Quality**: Same Whisper Large v3 model as OpenAI
  - **Formats**: Supports flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm
  - **Features**: Multilingual, timestamps (word/segment level), multiple response formats

---

## Core Features

### 1. Home Dashboard

- Overview cards (upcoming sessions, total clients, week stats)
- Recent activity timeline
- Quick actions (Add client, Schedule session, Start recording)
- Session completion analytics

### 2. Calendar

- Monthly/Weekly view of sessions
- Schedule new sessions
- Drag-to-reschedule
- Status indicators (scheduled, completed, cancelled)
- Filter by client

### 3. Sessions

- **List View**: All sessions with filters (date, client, status)
- **Session Detail**:
  - Session metadata (date, duration, client)
  - Audio playback with waveform
  - Transcript display with timestamps
  - Session notes editor
  - Export options
- **Recording Interface**:
  - Start/Stop/Pause recording
  - Real-time duration timer
  - Waveform visualization
  - Upload to Supabase Storage
  - Automatic transcription trigger

### 4. Clients

- Client directory (searchable, filterable)
- Client profile with session history
- Add/Edit/Archive operations
- Quick stats per client

---

## Quick Setup Guide

### 1. Create Accounts

**Daily.co**

1. Go to [https://dashboard.daily.co/signup](https://dashboard.daily.co/signup)
2. Sign up for free account (10,000 minutes/month)
3. Get API key from Dashboard > Developers
4. Add to `.env.local`: `DAILY_API_KEY=your-key-here`

**Groq API**

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up with GitHub/Google
3. Navigate to API Keys section
4. Create new API key
5. Add to `.env.local`: `GROQ_API_KEY=your-key-here`

**Supabase**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project
3. Wait 2-3 minutes for setup
4. Get credentials from Settings > API
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Install Dependencies

```bash
# Clone and install
npm install

# Install additional packages
npm install @supabase/supabase-js @supabase/ssr
npm install @daily-co/daily-js @daily-co/daily-react
npm install groq-sdk
npm install @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns lucide-react

# Initialize shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label table calendar dialog form select textarea avatar badge dropdown-menu separator tabs tooltip
```

### 3. Set Up Supabase Database

1. Copy the SQL schema from the Database Schema section
2. Go to Supabase Dashboard > SQL Editor
3. Paste and run the schema
4. Create storage bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('audio-recordings', 'audio-recordings', false);
   ```
5. Apply storage policies from Storage Buckets Configuration section

### 4. Test Video Calling

```typescript
// Quick test component
import { DailyProvider } from "@daily-co/daily-react";

export default function TestCall() {
  return (
    <DailyProvider>
      <div>Video call ready!</div>
    </DailyProvider>
  );
}
```

### 5. Test Groq Transcription

```typescript
// Quick test
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
  // Test with a sample audio file
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream("./test-audio.mp3"),
    model: "whisper-large-v3",
  });
  console.log(transcription.text);
}
```

---

## Supabase Setup (Next.js 15 Specific)

### Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Important**: Use `@supabase/ssr` (NOT `@supabase/auth-helpers-nextjs` - deprecated)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Client Structure

#### Browser Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Server Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

#### Middleware (Token Refresh)

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Database Schema

### Tables

```sql
-- Therapists (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_therapist ON clients(therapist_id);
CREATE INDEX idx_clients_status ON clients(status);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  -- Video calling fields
  call_type TEXT DEFAULT 'internal' CHECK (call_type IN ('internal', 'external_link', 'local_recording')),
  daily_room_url TEXT,
  daily_room_name TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX idx_sessions_client ON sessions(client_id);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_call_type ON sessions(call_type);

-- Recordings
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  transcript TEXT,
  transcript_status TEXT DEFAULT 'pending' CHECK (transcript_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recordings_session ON recordings(session_id);
CREATE INDEX idx_recordings_status ON recordings(transcript_status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Therapists can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = therapist_id);

-- Sessions policies
CREATE POLICY "Therapists can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = therapist_id);

-- Recordings policies
CREATE POLICY "Therapists can view own recordings"
  ON recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = recordings.session_id
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can insert own recordings"
  ON recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = recordings.session_id
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can update own recordings"
  ON recordings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = recordings.session_id
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can delete own recordings"
  ON recordings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = recordings.session_id
      AND sessions.therapist_id = auth.uid()
    )
  );
```

---

## Storage Buckets Configuration

### Create Bucket

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false);
```

### Storage RLS Policies

```sql
-- Upload policy
CREATE POLICY "Therapists can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Select policy
CREATE POLICY "Therapists can view own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete policy
CREATE POLICY "Therapists can delete own recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Audio Recording Implementation

### Custom Hook - useAudioRecorder

```typescript
// lib/hooks/use-audio-recorder.ts
import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const pausedTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Use WebM with Opus codec for best compression
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorder.current = new MediaRecorder(stream, { mimeType });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: mimeType });
        setAudioBlob(blob);
        audioChunks.current = [];

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Clear timer
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      startTime.current = Date.now();

      // Start duration timer
      timerInterval.current = setInterval(() => {
        setDuration(
          Math.floor(
            (Date.now() - startTime.current - pausedTime.current) / 1000
          )
        );
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && !isPaused) {
      mediaRecorder.current.pause();
      setIsPaused(true);
      pausedTime.current = Date.now();
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && isPaused) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      pausedTime.current = Date.now() - pausedTime.current;
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    audioChunks.current = [];
    pausedTime.current = 0;
  }, []);

  return {
    isRecording,
    isPaused,
    audioBlob,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  };
}
```

### Upload Audio to Supabase Storage

```typescript
// lib/actions/upload-audio.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadAudio(blob: Blob, sessionId: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const fileName = `${sessionId}_${Date.now()}.webm`;
  const filePath = `${user.id}/${sessionId}/${fileName}`;

  // Convert blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("audio-recordings")
    .upload(filePath, arrayBuffer, {
      contentType: "audio/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Save recording metadata to database
  const { error: dbError } = await supabase.from("recordings").insert({
    session_id: sessionId,
    file_path: data.path,
    file_size_bytes: blob.size,
    transcript_status: "pending",
  });

  if (dbError) {
    throw new Error(`Database error: ${dbError.message}`);
  }

  return { filePath: data.path };
}
```

---

## Video Calling Implementation

### Daily.co Integration

**Setup:**

1. Install Daily.co SDK:

```bash
npm install @daily-co/daily-js @daily-co/daily-react
```

2. Create room API route:

```typescript
// app/api/daily/create-room/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    // Create Daily.co room
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `session-${sessionId}`,
        privacy: "private",
        properties: {
          enable_recording: "cloud",
          enable_transcription: false, // We'll use Groq instead
          exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours expiry
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    const data = await response.json();

    // Save to database
    const supabase = await createClient();
    await supabase
      .from("sessions")
      .update({
        daily_room_url: data.url,
        daily_room_name: data.name,
        call_type: "internal",
      })
      .eq("id", sessionId);

    return NextResponse.json({ roomUrl: data.url, roomName: data.name });
  } catch (error) {
    console.error("Failed to create Daily.co room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
```

3. Video call component:

```typescript
// components/sessions/video-call.tsx
"use client";

import {
  useDaily,
  useScreenShare,
  useRecording,
  DailyProvider,
  DailyVideo,
} from "@daily-co/daily-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function VideoCall({
  roomUrl,
  sessionId,
}: {
  roomUrl: string;
  sessionId: string;
}) {
  const daily = useDaily();
  const { startRecording, stopRecording, isRecording } = useRecording();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!daily) return;

    const join = async () => {
      await daily.join({ url: roomUrl });
      setJoined(true);

      // Auto-start recording
      await startRecording();
    };

    join();

    // Handle recording stopped
    daily.on("recording-stopped", async (event) => {
      // Download recording and trigger transcription
      await handleRecordingStopped(event, sessionId);
    });

    return () => {
      daily.leave();
      daily.destroy();
    };
  }, [daily, roomUrl]);

  return (
    <div className="space-y-4">
      <DailyVideo />
      <div className="flex gap-2">
        {isRecording && <div className="text-red-600">🔴 Recording</div>}
        <Button onClick={() => daily?.leave()}>End Call</Button>
      </div>
    </div>
  );
}

async function handleRecordingStopped(event: any, sessionId: string) {
  // Download recording from Daily.co and upload to Supabase
  const response = await fetch(`/api/sessions/${sessionId}/process-recording`, {
    method: "POST",
    body: JSON.stringify({ recordingId: event.recordingId }),
  });

  if (!response.ok) {
    console.error("Failed to process recording");
  }
}
```

---

## Transcription with Groq API

### Groq Setup (Whisper Models - Ultra Fast)

**Why Groq:**

- 32x faster than OpenAI Whisper API
- Multiple model options (standard vs turbo)
- Free tier available (25MB file limit)
- Near real-time transcription
- Compatible with OpenAI API format

**Available Models:**

1. **whisper-large-v3** (Recommended for accuracy)

   - Highest accuracy for multilingual transcription
   - Supports 99+ languages
   - Best for healthcare/therapy where accuracy is critical
   - Speed: Processes 1 hour audio in ~2 minutes

2. **whisper-large-v3-turbo** (Recommended for speed)
   - 2-3x faster than standard model
   - Optimized for quick processing
   - Still maintains high accuracy
   - Speed: Processes 1 hour audio in ~30 seconds
   - Best for real-time or near-real-time needs

**File Size Limits:**

- Free tier: 25 MB per file
- Dev tier: 100 MB per file
- For larger files: Implement chunking strategy

**Setup:**

1. Install Groq SDK:

```bash
npm install groq-sdk
```

2. Create transcription server action:

```typescript
// lib/actions/transcribe-groq.ts
"use server";

import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function transcribeAudio(recordingId: string) {
  const supabase = await createClient();

  try {
    // Get recording details
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("file_path, session_id")
      .eq("id", recordingId)
      .single();

    if (fetchError) throw fetchError;

    // Update status to processing
    await supabase
      .from("recordings")
      .update({ transcript_status: "processing" })
      .eq("id", recordingId);

    // Download audio from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("audio-recordings")
      .download(recording.file_path);

    if (downloadError) throw downloadError;

    // Save to temp file (Groq SDK requires file path)
    const tempFilePath = path.join(tmpdir(), `audio-${recordingId}.webm`);
    const buffer = await audioData.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // Transcribe with Groq
    // Choose model based on your needs:
    // - whisper-large-v3: Best accuracy (recommended for therapy)
    // - whisper-large-v3-turbo: Fastest speed
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3", // or "whisper-large-v3-turbo" for faster processing
      response_format: "verbose_json", // Options: json, text, verbose_json, srt, vtt
      language: "en", // ISO-639-1 code (e.g., "en", "es", "fr") - helps improve accuracy
      temperature: 0.0, // 0-1, lower = more deterministic
      timestamp_granularities: ["segment"], // or ["word"] for word-level timestamps
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Update recording with transcript
    const { error: updateError } = await supabase
      .from("recordings")
      .update({
        transcript: transcription.text,
        transcript_status: "completed",
        duration_seconds: Math.floor(transcription.duration || 0),
      })
      .eq("id", recordingId);

    if (updateError) throw updateError;

    return { success: true, transcript: transcription.text };
  } catch (error) {
    console.error("Groq transcription error:", error);

    // Update status to failed
    await supabase
      .from("recordings")
      .update({ transcript_status: "failed" })
      .eq("id", recordingId);

    throw error;
  }
}
```

3. Alternative: Use Supabase Edge Function with Groq:

```typescript
// supabase/functions/transcribe-groq/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { recordingId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recording
    const { data: recording } = await supabase
      .from("recordings")
      .select("file_path")
      .eq("id", recordingId)
      .single();

    // Update status
    await supabase
      .from("recordings")
      .update({ transcript_status: "processing" })
      .eq("id", recordingId);

    // Download audio
    const { data: audioData } = await supabase.storage
      .from("audio-recordings")
      .download(recording.file_path);

    // Send to Groq API
    const formData = new FormData();
    formData.append("file", audioData, "audio.webm");
    formData.append("model", "whisper-large-v3"); // or "whisper-large-v3-turbo"
    formData.append("response_format", "verbose_json"); // json, text, verbose_json, srt, vtt
    formData.append("language", "en"); // Specify language for better accuracy
    formData.append("temperature", "0"); // 0-1, lower = more deterministic
    formData.append("timestamp_granularities[]", "segment"); // segment or word

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
        },
        body: formData,
      }
    );

    const result = await groqResponse.json();

    // Update with transcript
    await supabase
      .from("recordings")
      .update({
        transcript: result.text,
        transcript_status: "completed",
        duration_seconds: Math.floor(result.duration || 0),
      })
      .eq("id", recordingId);

    return new Response(
      JSON.stringify({ success: true, transcript: result.text }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

4. Deploy Edge Function:

```bash
supabase functions deploy transcribe-groq --no-verify-jwt
supabase secrets set GROQ_API_KEY=your-groq-api-key
```

5. Trigger transcription:

```typescript
// After recording is uploaded
await fetch("/api/sessions/transcribe", {
  method: "POST",
  body: JSON.stringify({ recordingId }),
});

// Or call server action directly
import { transcribeAudio } from "@/lib/actions/transcribe-groq";
await transcribeAudio(recordingId);
```

### Model Selection Guide

**Use `whisper-large-v3` when:**

- Accuracy is the top priority (therapy sessions, medical records)
- Working with multiple languages or accents
- Audio quality is poor or has background noise
- You can afford 2 minutes processing time per hour of audio

**Use `whisper-large-v3-turbo` when:**

- Speed is critical (near real-time feedback needed)
- Processing high volume of recordings
- Audio quality is good (clear speech, minimal background noise)
- You need faster user experience (30 seconds per hour)

**Recommended for this project:** `whisper-large-v3` (accuracy is critical for therapy notes)

### Handling Large Audio Files

If your audio files exceed the size limits, implement chunking:

```typescript
// lib/actions/chunk-transcribe.ts
"use server";

import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import ffmpeg from "fluent-ffmpeg"; // npm install fluent-ffmpeg

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function transcribeLargeAudio(recordingId: string) {
  const supabase = await createClient();
  const CHUNK_SIZE_MB = 20; // Stay under 25MB limit

  try {
    // Download audio
    const { data: recording } = await supabase
      .from("recordings")
      .select("file_path")
      .eq("id", recordingId)
      .single();

    const { data: audioData } = await supabase.storage
      .from("audio-recordings")
      .download(recording.file_path);

    const tempFilePath = path.join(tmpdir(), `audio-${recordingId}.webm`);
    const buffer = await audioData.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // Check file size
    const stats = fs.statSync(tempFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB <= CHUNK_SIZE_MB) {
      // File is small enough, transcribe directly
      return await transcribeFile(tempFilePath, recordingId);
    }

    // File too large, split into chunks
    const chunks = await splitAudioIntoChunks(tempFilePath, CHUNK_SIZE_MB);
    const transcriptions: string[] = [];

    for (const chunkPath of chunks) {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: "whisper-large-v3",
        response_format: "text",
        language: "en",
      });
      transcriptions.push(transcription.text);
      fs.unlinkSync(chunkPath); // Clean up chunk
    }

    // Combine all transcriptions
    const fullTranscript = transcriptions.join(" ");

    // Save to database
    await supabase
      .from("recordings")
      .update({
        transcript: fullTranscript,
        transcript_status: "completed",
      })
      .eq("id", recordingId);

    // Clean up
    fs.unlinkSync(tempFilePath);

    return { success: true, transcript: fullTranscript };
  } catch (error) {
    console.error("Chunked transcription error:", error);
    throw error;
  }
}

async function splitAudioIntoChunks(
  filePath: string,
  chunkSizeMB: number
): Promise<string[]> {
  // Implementation using ffmpeg to split audio
  // This is a simplified version
  const outputDir = path.join(tmpdir(), `chunks-${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const chunkPaths: string[] = [];
  const chunkDuration = 600; // 10 minutes per chunk

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        "-f segment",
        `-segment_time ${chunkDuration}`,
        "-c copy",
      ])
      .output(path.join(outputDir, "chunk-%03d.webm"))
      .on("end", () => {
        const files = fs.readdirSync(outputDir);
        resolve(files.map((f) => path.join(outputDir, f)));
      })
      .on("error", reject)
      .run();
  });
}

async function transcribeFile(filePath: string, recordingId: string) {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    response_format: "verbose_json",
    language: "en",
  });

  const supabase = await createClient();
  await supabase
    .from("recordings")
    .update({
      transcript: transcription.text,
      transcript_status: "completed",
      duration_seconds: Math.floor(transcription.duration || 0),
    })
    .eq("id", recordingId);

  fs.unlinkSync(filePath);
  return { success: true, transcript: transcription.text };
}
```

### Response Format Options

Groq supports multiple response formats:

1. **json** - Basic transcription:

```json
{
  "text": "Hello, this is a therapy session..."
}
```

2. **verbose_json** - With timestamps and metadata:

```json
{
  "task": "transcribe",
  "language": "en",
  "duration": 3600.5,
  "text": "Hello, this is a therapy session...",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 5.2,
      "text": " Hello, this is a therapy session...",
      "tokens": [50364, 2425, 11, 341, 307, 257, 9492, 5481, 4386, 50614],
      "temperature": 0.0,
      "avg_logprob": -0.2,
      "compression_ratio": 1.5,
      "no_speech_prob": 0.01
    }
  ]
}
```

3. **text** - Plain text only:

```
Hello, this is a therapy session...
```

4. **srt** - SubRip subtitle format:

```
1
00:00:00,000 --> 00:00:05,200
Hello, this is a therapy session...
```

5. **vtt** - WebVTT subtitle format:

```
WEBVTT

00:00:00.000 --> 00:00:05.200
Hello, this is a therapy session...
```

**Recommendation:** Use `verbose_json` for maximum flexibility and to store segment timestamps for better transcript navigation.

---

## Complete Session Workflow

### Workflow 1: Internal Call (Daily.co)

1. **Session Creation**

   - Therapist creates a new session
   - Selects "Built-in Video Call"
   - System creates Daily.co room via API
   - Room URL and name saved to database

2. **Session Start**

   - Therapist joins Daily.co room
   - Client joins via shared link
   - Recording starts automatically
   - Real-time video/audio call with built-in features

3. **Session End**

   - Therapist ends call
   - Daily.co stops recording automatically
   - Recording is downloaded from Daily.co
   - Audio file uploaded to Supabase Storage
   - Session status updated to 'completed'

4. **Transcription**

   - Recording metadata saved to database
   - Groq transcription triggered automatically
   - Transcript processed in ~2 minutes (for 1-hour session)
   - Transcript saved to database
   - Therapist notified

5. **Review**
   - Therapist reviews session
   - Plays back recording
   - Edits transcript if needed
   - Adds session notes

### Workflow 2: External Link (Zoom/Meet)

1. **Session Creation**

   - Therapist creates a new session
   - Selects "External Meeting Link"
   - Pastes Zoom/Meet URL
   - System saves meeting URL to database

2. **Session Preparation**

   - Before joining external call, therapist opens session page
   - Manual recording interface displayed
   - Instructions shown to record locally

3. **Session Start**

   - Therapist starts local recording using MediaRecorder
   - Joins external Zoom/Meet call
   - Records audio from system/microphone
   - Timer displays recording duration

4. **Session End**

   - Therapist stops local recording
   - Audio blob created and uploaded to Supabase Storage
   - Session status updated to 'completed'

5. **Transcription**

   - Recording metadata saved to database
   - Groq transcription triggered
   - Transcript processed and saved
   - Therapist notified

6. **Review**
   - Same as Workflow 1

### Call Type Comparison

| Feature             | Internal Call (Daily.co)  | External Link                    |
| ------------------- | ------------------------- | -------------------------------- |
| Setup Complexity    | Low (automatic)           | Medium (manual recording)        |
| Recording Quality   | High (cloud)              | Depends on local setup           |
| Video Support       | Yes                       | No (audio only)                  |
| Automatic Recording | Yes                       | No (manual)                      |
| Client Experience   | Simple (just join link)   | Uses familiar Zoom/Meet          |
| Cost                | Free (10k min/month)      | Free                             |
| Best For            | New clients, full control | Clients with platform preference |

---

## Pricing & Cost Analysis

### Free Tier Limits

1. **Daily.co**

   - 10,000 minutes/month free (first year)
   - ~167 hours of video calls
   - After: $0.0015-0.002/minute ($0.09-0.12/hour)

2. **Groq API (Transcription)**

   - **Free tier**: 25 MB file limit, rate limits apply
   - **Dev tier**: 100 MB file limit
   - **Rate limits**: 30 requests/minute, 14,400 requests/day
   - **Cost**: ~$0.00185/minute ($0.111/hour) for paid usage
   - **Models**:
     - `whisper-large-v3`: 2 min processing per hour of audio
     - `whisper-large-v3-turbo`: 30 sec processing per hour of audio

3. **Supabase**
   - 500 MB database
   - 1 GB file storage
   - 2 GB bandwidth
   - 50,000 monthly active users
   - After: Starting at $25/month (Pro plan)

### Cost Estimates (Monthly)

**Scenario: 50 sessions/month, 1 hour each = 50 hours**

| Service                     | Free Tier               | Cost if Paid      |
| --------------------------- | ----------------------- | ----------------- |
| Daily.co Video Calls        | ✅ Free (under 167 hrs) | $4.50-6.00        |
| Groq Transcription (50 hrs) | ✅ Free\*               | ~$5.55            |
| Supabase Storage (~5 GB)    | ⚠️ Need Pro             | $25               |
| **Total**                   | **~$25/month**          | **~$35-37/month** |

\*Free tier should cover 50 sessions/month with rate limits

**Scenario: 200 sessions/month, 1 hour each = 200 hours**

| Service            | Cost                      |
| ------------------ | ------------------------- |
| Daily.co           | ~$24-36 (after free tier) |
| Groq Transcription | ~$22                      |
| Supabase Pro       | $25                       |
| **Total**          | **~$71-83/month**         |

### Cost-Saving Tips

1. **Use External Links More**: Encourage clients with Zoom/Meet to use their links (free recording)
2. **Optimize Storage**: Delete old recordings after transcription
3. **Batch Processing**: Process transcriptions during off-peak hours
4. **Audio-Only**: Use audio-only mode in Daily.co to reduce file sizes

---

## Dependencies to Install

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# Video calling
npm install @daily-co/daily-js @daily-co/daily-react

# Transcription
npm install groq-sdk

# State management & data fetching
npm install @tanstack/react-query zustand

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Date utilities
npm install date-fns

# UI components
npm install lucide-react

# Calendar (required for Phase 3 - integrated with Sessions)
# Recommended: react-big-calendar (free, MIT license, excellent drag-and-drop)
npm install react-big-calendar date-fns
npm install --save-dev @types/react-big-calendar
# Alternative: FullCalendar (more features but paid for advanced options)
# npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid

# Audio visualization (optional)
npm install wavesurfer.js

# shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button card input label table calendar dialog form select textarea avatar badge dropdown-menu separator tabs tooltip
```

### Environment Variables

Update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Daily.co
DAILY_API_KEY=your-daily-api-key

# Groq API
GROQ_API_KEY=your-groq-api-key
```

---

## Project Structure

```
empath-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Sidebar navigation
│   │   │   ├── page.tsx                # Home dashboard
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx            # Sessions list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx        # Session detail
│   │   │   │   └── new/
│   │   │   │       └── page.tsx        # Create session
│   │   │   └── clients/
│   │   │       ├── page.tsx            # Clients list
│   │   │       ├── [id]/
│   │   │       │   └── page.tsx        # Client profile
│   │   │       └── new/
│   │   │           └── page.tsx        # Add client
│   │   └── layout.tsx
│   ├── api/
│   │   ├── daily/
│   │   │   └── create-room/
│   │   │       └── route.ts
│   │   ├── sessions/
│   │   │   ├── [id]/
│   │   │   │   └── process-recording/
│   │   │   │       └── route.ts
│   │   │   └── transcribe/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── transcription/
│   │           └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                              # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── stats-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── nav-user.tsx
│   ├── sessions/
│   │   ├── video-call.tsx              # Daily.co video call component
│   │   ├── audio-recorder.tsx          # Manual recording for external calls
│   │   ├── audio-player.tsx
│   │   ├── session-form.tsx            # Includes call type selection
│   │   ├── session-table.tsx
│   │   ├── transcript-viewer.tsx
│   │   └── call-type-selector.tsx      # Internal vs External call selector
│   └── clients/
│       ├── client-form.tsx
│       ├── client-table.tsx
│       └── client-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── middleware.ts
│   ├── hooks/
│   │   ├── use-audio-recorder.ts
│   │   ├── use-clients.ts
│   │   ├── use-sessions.ts
│   │   └── use-user.ts
│   ├── actions/
│   │   ├── upload-audio.ts
│   │   ├── transcribe-groq.ts          # Groq API transcription
│   │   ├── daily-rooms.ts              # Daily.co room management
│   │   ├── clients.ts
│   │   └── sessions.ts
│   ├── utils.ts
│   └── types.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   └── 20240101000001_storage_policies.sql
│   └── functions/
│       └── transcribe-groq/              # Groq transcription edge function
│           ├── index.ts
│           └── deno.json
├── .env.local
├── middleware.ts
├── IMPLEMENTATION_PLAN.md
└── package.json
```

---

## Implementation Phases

### Phase 1: Foundation & Authentication (Week 1)

**Tasks:**

1. Create Supabase project
2. Set up database schema and RLS policies
3. Configure storage buckets
4. Install dependencies
5. Create Supabase client utilities (browser, server, middleware)
6. Build authentication pages (login, signup)
7. Implement protected routes middleware
8. Create basic dashboard layout with sidebar navigation

**Deliverables:**

- Working authentication system
- Protected dashboard routes
- Basic navigation structure

### Phase 2: Clients Module (Week 1-2)

**Tasks:**

1. Create clients table UI with shadcn DataTable
2. Implement client search and filtering
3. Build add/edit client forms with validation
4. Create client profile page
5. Add client archiving functionality
6. Display session history per client

**Deliverables:**

- Full CRUD for clients
- Searchable, filterable client directory
- Client profile with session history

### Phase 3: Sessions Module (Week 2-3)

**Tasks:**

1. Create sessions list view with filters
2. Build session scheduling form
3. Implement session status management
4. Create session detail page structure
5. Add session notes editor (markdown support)
6. Implement session updates and cancellation

**Deliverables:**

- Sessions list with filtering
- Session scheduling functionality
- Session detail pages with notes

### Phase 4: Video Calling & Recording (Week 3-4)

**Tasks:**

1. Set up Daily.co account and API keys
2. Create Daily.co room creation API route
3. Build video call component with Daily.co React SDK
4. Implement call type selection in session form:
   - Internal call (Daily.co)
   - External link (Zoom/Meet with local recording)
5. Add recording controls and indicators
6. Implement MediaRecorder for external call scenarios
7. Build recording UI components:
   - Start/Stop/Pause controls
   - Duration timer
   - Waveform visualization (optional)
8. Handle Daily.co recording download and storage
9. Add upload to Supabase Storage
10. Create audio player component
11. Handle recording errors and permissions

**Deliverables:**

- Working video call interface with Daily.co
- Support for external meeting links
- Audio/video recording functionality
- Recording storage in Supabase
- Playback functionality

### Phase 5: Transcription with Groq (Week 4)

**Tasks:**

1. Set up Groq API account and keys
2. Install Groq SDK
3. Create Groq transcription server action or Edge Function
4. Implement transcription trigger on upload
5. Build transcript viewer component with timestamps
6. Add transcript editing capability
7. Display processing status indicators (pending, processing, completed, failed)
8. Handle transcription errors and retries
9. Test transcription speed and accuracy

**Deliverables:**

- Ultra-fast automatic transcription using Groq
- Transcript viewer with edit capability
- Status tracking for transcription jobs
- Real-time transcription status updates

### Phase 6: Calendar View (Week 5)

**Tasks:**

1. Integrate calendar library (react-big-calendar or FullCalendar)
2. Display sessions on calendar
3. Implement session creation from calendar
4. Add drag-to-reschedule functionality
5. Color-code by status
6. Add filter by client

**Deliverables:**

- Interactive calendar with sessions
- Scheduling from calendar view
- Drag-and-drop rescheduling

### Phase 7: Home Dashboard & Analytics (Week 5-6)

**Tasks:**

1. Create dashboard stat cards:
   - Total clients
   - Upcoming sessions
   - This week's sessions
   - Session completion rate
2. Build activity feed component
3. Add quick action buttons
4. Implement data aggregation queries
5. Create charts/graphs (optional)
6. Add date range filters

**Deliverables:**

- Complete home dashboard
- Key metrics and statistics
- Recent activity feed

---

## Security Considerations

### 1. Row Level Security (RLS)

- All database tables have RLS enabled
- Therapists can only access their own data
- Policies enforce data isolation at database level

### 2. Storage Security

- Audio files stored in private buckets
- File paths include user ID for access control
- RLS policies on storage.objects table
- Signed URLs for temporary access

### 3. API Security

- OpenAI API key stored in Supabase Edge Function secrets
- Never expose API keys in client-side code
- Use Supabase Service Role key only in Edge Functions

### 4. File Upload Limits

- Max file size: 25MB (Whisper limit)
- Validate file types (audio only)
- Implement rate limiting for uploads

### 5. Session Management

- HTTP-only cookies for session tokens
- Automatic token refresh via middleware
- Session timeout after 1 hour idle
- Secure logout that clears all cookies

### 6. Data Privacy

- HIPAA considerations (note: full compliance requires additional infrastructure)
- Delete recordings option for users
- Data retention policies
- Encryption at rest (Supabase default)

### 7. Client-Side Security

- Input validation on all forms
- Sanitize user input before display
- CSRF protection via Supabase
- XSS prevention

---

## Performance Optimization

### 1. Database

- Index on frequently queried columns
- Use `select` to fetch only needed columns
- Implement pagination for large datasets
- Use database views for complex queries

### 2. Audio Files

- Compress audio with Opus codec
- Use WebM format (best compression)
- Lazy load audio players
- Implement progressive download for playback

### 3. Frontend

- Use React Query for caching
- Implement optimistic updates
- Lazy load calendar and heavy components
- Use Next.js Image optimization
- Implement virtual scrolling for long lists

### 4. Real-time Updates

- Use Supabase Realtime selectively
- Subscribe only to needed channels
- Unsubscribe on component unmount

---

## Testing Strategy

### Unit Tests

- Utility functions
- Custom hooks
- Form validation schemas

### Integration Tests

- Authentication flows
- CRUD operations
- File upload/download
- Transcription pipeline

### E2E Tests (Optional)

- User registration and login
- Complete session workflow
- Recording and playback
- Client management

---

## Deployment

### Prerequisites

- Vercel account (or similar)
- Supabase project (production)
- OpenAI API key

### Steps

1. Set up production Supabase project
2. Run database migrations
3. Configure environment variables in Vercel
4. Deploy Edge Functions to Supabase
5. Deploy Next.js app to Vercel
6. Test authentication and critical paths
7. Set up monitoring and error tracking

### Environment Variables

```env
# Production .env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DAILY_API_KEY=your-daily-api-key
GROQ_API_KEY=your-groq-api-key
```

## Resources

### Documentation

- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Daily.co API Documentation](https://docs.daily.co/reference/rest-api)
- [Daily.co React SDK](https://docs.daily.co/reference/daily-react)
- [Groq API Documentation](https://console.groq.com/docs)
- [Groq SDK (Node.js)](https://github.com/groq/groq-js)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### Design Inspiration

- [Upheal Dashboard](https://app.upheal.io/)
- [Dribbble Healthcare Dashboards](https://dribbble.com/tags/healthcare-dashboard)
- [Healthcare UI Examples](https://www.koruux.com/50-examples-of-healthcare-UI/)

### Community

- [Supabase Discord](https://discord.supabase.com/)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

## Support & Troubleshooting

### Common Issues

**1. Supabase Client Not Working in Server Components**

- Use `createClient()` from `lib/supabase/server.ts`
- Always `await cookies()` in Next.js 15

**2. MediaRecorder Not Supported**

- Check browser compatibility
- Provide fallback UI with error message
- Test on multiple browsers (Chrome, Firefox, Safari)

**3. Transcription Takes Too Long**

- Large files take time with Whisper
- Implement progress indicators
- Consider chunking large files

**4. Storage Upload Fails**

- Check file size limit (25MB)
- Verify RLS policies
- Ensure proper file path structure

**5. RLS Policies Blocking Access**

- Verify `auth.uid()` is set
- Check policy conditions
- Test with Supabase SQL Editor

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building the Empath Dashboard with integrated video calling and ultra-fast transcription. Follow the phases sequentially, ensuring each module is fully tested before moving to the next. The modular structure allows for easy maintenance and future enhancements.

**Estimated Timeline:** 5-6 weeks for full implementation
**Team Size:** 1-2 developers
**Complexity:** Intermediate to Advanced

### Key Technology Decisions

✅ **Video Calling:** Daily.co (10,000 free minutes/month, HIPAA-compliant option)
✅ **Transcription:** Groq API with Whisper Large v3 (32x faster than OpenAI, free tier)
✅ **Database & Storage:** Supabase (PostgreSQL + file storage with RLS)
✅ **Framework:** Next.js 15 with App Router and React 19

### What Makes This Stack Great

1. **Cost-Effective**: ~$25-37/month for 50 sessions with generous free tiers
2. **Fast Transcription**: Process 1-hour audio in ~2 minutes with Groq
3. **Flexible Calling**: Built-in video calls OR support for external Zoom/Meet links
4. **Production Ready**: All services have HIPAA-compliant options available
5. **Great DX**: Modern TypeScript stack with excellent tooling

### Next Steps After Implementation

1. **Add AI Features**: Use Groq for session summaries and insights generation
2. **Enhanced Analytics**: Session trends, client progress tracking
3. **Mobile App**: React Native version for on-the-go access
4. **Team Features**: Multi-therapist support with role-based access
5. **Client Portal**: Let clients view their session history and notes

Good luck with your build! 🚀

---

## Change Log

**Updated:** October 19, 2025

### Major Changes

- ✅ Replaced OpenAI Whisper with Groq API for 32x faster transcription
- ✅ Added Daily.co integration for built-in video calling
- ✅ Added support for external meeting links (Zoom/Meet)
- ✅ Updated database schema with call type fields
- ✅ Added comprehensive session workflows for both call types
- ✅ Added pricing analysis and cost comparison
- ✅ Added Quick Setup Guide for all services
- ✅ Updated all code examples and dependencies
- ✅ Added detailed Groq model comparison (whisper-large-v3 vs turbo)
- ✅ Added audio chunking strategy for large files
- ✅ Added response format options and examples
- ✅ Clarified file size limits and rate limits

---

## Groq API Best Practices

### 1. Model Selection

- **Production**: Use `whisper-large-v3` for highest accuracy
- **Development/Testing**: Use `whisper-large-v3-turbo` for faster iteration
- **High Volume**: Consider turbo model to reduce processing time

### 2. Optimize Audio Files

```typescript
// Before uploading to Groq, optimize audio
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function optimizeAudio(inputPath: string, outputPath: string) {
  // Convert to optimal format and reduce size
  await execAsync(
    `ffmpeg -i ${inputPath} -ar 16000 -ac 1 -c:a libopus -b:a 32k ${outputPath}`
  );
  // -ar 16000: 16kHz sample rate (sufficient for speech)
  // -ac 1: mono audio (speech doesn't need stereo)
  // -b:a 32k: 32kbps bitrate (good balance of quality/size)
}
```

### 3. Error Handling

```typescript
async function transcribeWithRetry(audioPath: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-large-v3",
        response_format: "verbose_json",
      });
      return transcription;
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limit hit, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      if (error.status === 413) {
        // File too large
        throw new Error("Audio file exceeds size limit. Use chunking.");
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
```

### 4. Rate Limit Management

```typescript
// lib/utils/rate-limiter.ts
let queue: Array<() => Promise<any>> = [];
let processing = false;
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute

export async function enqueueGroqRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;

  while (queue.length > 0) {
    // Check rate limit (30 requests per minute)
    if (requestCount >= 30) {
      const waitTime = resetTime - Date.now();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      requestCount = 0;
      resetTime = Date.now() + 60000;
    }

    const task = queue.shift();
    if (task) {
      requestCount++;
      await task();
    }
  }

  processing = false;
}

// Usage:
// await enqueueGroqRequest(() => groq.audio.transcriptions.create({...}));
```

### 5. Cost Optimization Tips

- Compress audio before transcription (reduces size & processing time)
- Use `whisper-large-v3-turbo` when accuracy difference is negligible
- Cache transcriptions to avoid re-processing
- Delete old audio files after transcription completes
- Monitor usage with Groq dashboard to stay within free tier

### 6. Language Support

Groq's Whisper models support 99+ languages. Specify the language code for better accuracy:

```typescript
const languageCodes = {
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  portuguese: "pt",
  russian: "ru",
  japanese: "ja",
  chinese: "zh",
  // ... and many more
};

const transcription = await groq.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-large-v3",
  language: languageCodes.english, // Improves accuracy
});
```

### 7. Quality Checks

```typescript
function validateTranscription(result: any): boolean {
  // Check if transcription seems valid
  if (!result.text || result.text.trim().length === 0) {
    return false;
  }

  // Check if it's mostly silence
  if (result.no_speech_prob && result.no_speech_prob > 0.9) {
    console.warn("Audio appears to be mostly silence");
    return false;
  }

  // Check compression ratio (too high might indicate poor transcription)
  if (result.compression_ratio && result.compression_ratio > 2.5) {
    console.warn("Unusual compression ratio detected");
  }

  return true;
}
```
