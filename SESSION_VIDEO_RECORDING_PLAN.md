# Session Video Call, Recording, Transcription & Summary - Implementation Plan

> **Focus**: This plan covers ONLY the remaining Daily.co video call, cloud recording, transcription, and AI summary features. All foundational work is already complete.
>
> **Note**: For now, we're implementing ONLY Daily.co video calls. External meeting links and local recording options will be removed.

---

## ✅ Already Completed

You've built a solid foundation with:

### Database & Infrastructure
- ✅ **Supabase Setup**: PostgreSQL database with RLS policies
- ✅ **Tables Created**:
  - `sessions` - with `daily_room_url`, `daily_room_name` fields
  - `recordings` - with `file_path`, `transcript`, `transcript_status` fields
- ✅ **Storage Bucket**: `audio-recordings` with security policies configured
- ✅ **Authentication**: Login/signup with protected routes

### Session Management
- ✅ **Session CRUD**: Create, read, update, delete sessions
- ✅ **Session Form**: For scheduling video call sessions
- ✅ **Session List**: With filters and status management
- ✅ **Session Detail Page**: Shows session info, client details, notes
- ✅ **Calendar View**: Schedule and view sessions
- ✅ **Status Management**: scheduled → in_progress → completed/cancelled

### Client Management
- ✅ **Client Directory**: Searchable list of clients
- ✅ **Client Profiles**: With session history
- ✅ **Client CRUD**: Full management operations

### UI/UX
- ✅ **Modern Dashboard**: With sidebar navigation
- ✅ **Design System**: Tailwind CSS with custom theme
- ✅ **Component Library**: shadcn/ui components

---

## 🎯 What Needs to Be Implemented

### Phase 1: Setup & Dependencies
- Install Daily.co and Groq SDKs
- Configure API keys
- Test API connections

### Phase 2: Video Calling with Daily.co
- Create Daily room API endpoint
- Build video call component with cloud recording
- Handle recording download from Daily.co
- Process and upload recording to Supabase Storage

### Phase 3: Transcription with Groq Whisper
- Create transcription server action
- Process audio files with Groq Whisper Large v3
- Build transcript viewer component
- Handle transcription status tracking

### Phase 4: AI Summary with Groq LLaMA
- Add summary fields to database
- Generate summaries using Groq LLaMA 3.1
- Create summary display component
- Auto-trigger after transcription

### Phase 5: Audio Playback
- Build audio player component
- Add playback controls
- Integrate with session detail page

---

## 📦 Phase 1: Setup & Dependencies

### 1.1 Install Required Packages

```bash
npm install @daily-co/daily-js @daily-co/daily-react groq-sdk
```

**Package Details:**
- `@daily-co/daily-js` - Daily.co JavaScript SDK for video calls
- `@daily-co/daily-react` - React hooks for Daily.co integration
- `groq-sdk` - Official Groq SDK for Whisper transcription and LLaMA summaries

### 1.2 Environment Variables

Add to `.env.local`:

```env
# Daily.co API Key
DAILY_API_KEY=your-daily-api-key-here

# Groq API Key (for both Whisper and LLaMA)
GROQ_API_KEY=your-groq-api-key-here
```

### 1.3 Get API Keys

**Daily.co:**
1. Sign up at https://dashboard.daily.co/signup
2. Free tier: 10,000 minutes/month
3. Navigate to Dashboard → Developers → API Keys
4. Copy your API key

**Groq:**
1. Sign up at https://console.groq.com/
2. Free tier available with rate limits
3. Navigate to API Keys section
4. Create new key and copy

### 1.4 Test Connection (Optional)

Create a simple test to verify APIs:

```typescript
// Test Daily.co
const response = await fetch('https://api.daily.co/v1/', {
  headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` }
});

// Test Groq
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const models = await groq.models.list();
console.log('Available models:', models);
```

---

## 🎥 Phase 2: Video Calling with Daily.co

### 2.1 Create Daily Room API Route

**File**: `app/api/daily/create-room/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Daily.co room
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `session-${sessionId}`,
        privacy: 'private',
        properties: {
          enable_recording: 'cloud',
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

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create room');
    }

    // Save room details to session
    await supabase
      .from('sessions')
      .update({
        daily_room_url: data.url,
        daily_room_name: data.name,
      })
      .eq('id', sessionId)
      .eq('therapist_id', user.id);

    return NextResponse.json({ 
      roomUrl: data.url, 
      roomName: data.name 
    });
  } catch (error) {
    console.error('Failed to create Daily.co room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
```

### 2.2 Create Video Call Component

**File**: `components/sessions/video-call.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useDaily, useRecording, DailyProvider, DailyVideo } from '@daily-co/daily-react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VideoCallProps {
  roomUrl: string;
  sessionId: string;
  onCallEnd?: () => void;
}

function VideoCallContent({ roomUrl, sessionId, onCallEnd }: VideoCallProps) {
  const daily = useDaily();
  const { startRecording, stopRecording, isRecording } = useRecording();
  const [joined, setJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!daily) return;

    const join = async () => {
      try {
        await daily.join({ url: roomUrl });
        setJoined(true);

        // Auto-start recording
        await startRecording();
      } catch (error) {
        console.error('Failed to join call:', error);
      }
    };

    join();

    // Handle recording events
    daily.on('recording-stopped', async (event) => {
      console.log('Recording stopped:', event);
      // Trigger processing
      await fetch(`/api/sessions/${sessionId}/process-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: event.recordingId }),
      });
    });

    return () => {
      daily.leave();
      daily.destroy();
    };
  }, [daily, roomUrl, sessionId, startRecording]);

  const toggleVideo = () => {
    if (daily) {
      daily.setLocalVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (daily) {
      daily.setLocalAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const endCall = async () => {
    if (daily) {
      if (isRecording) {
        await stopRecording();
      }
      await daily.leave();
      onCallEnd?.();
    }
  };

  if (!joined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-600">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden">
        <DailyVideo />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant={videoEnabled ? 'outline' : 'destructive'}
          size="lg"
          className="rounded-xl"
          onClick={toggleVideo}
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={audioEnabled ? 'outline' : 'destructive'}
          size="lg"
          className="rounded-xl"
          onClick={toggleAudio}
        >
          {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-xl"
          onClick={endCall}
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          End Call
        </Button>
      </div>
    </div>
  );
}

export function VideoCall(props: VideoCallProps) {
  return (
    <DailyProvider>
      <VideoCallContent {...props} />
    </DailyProvider>
  );
}
```

### 2.3 Integration Points

**Update Session Detail Page** (`app/(dashboard)/dashboard/sessions/[id]/page.tsx`):

Add button to start video call:

```typescript
// In the Quick Actions section, add:
{session.status === 'scheduled' && (
  <Button
    onClick={async () => {
      // Create Daily room
      const response = await fetch('/api/daily/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const { roomUrl } = await response.json();
      
      // Update status to in_progress
      await handleStatusChange('in_progress');
      
      // Show video call UI
      setShowVideoCall(true);
    }}
  >
    <Video className="mr-2 h-4 w-4" />
    Start Video Call
  </Button>
)}
```

---

## 📝 Phase 3: Transcription with Groq Whisper

### 3.1 Create Transcription Server Action

**File**: `lib/actions/transcribe-groq.ts`

```typescript
'use server';

import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function transcribeAudio(recordingId: string) {
  const supabase = await createClient();

  try {
    // Get recording details
    const { data: recording, error: fetchError } = await supabase
      .from('recordings')
      .select('file_path, session_id')
      .eq('id', recordingId)
      .single();

    if (fetchError) throw fetchError;

    // Update status to processing
    await supabase
      .from('recordings')
      .update({ transcript_status: 'processing' })
      .eq('id', recordingId);

    // Download audio from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('audio-recordings')
      .download(recording.file_path);

    if (downloadError) throw downloadError;

    // Save to temp file
    const tempFilePath = path.join(tmpdir(), `audio-${recordingId}.webm`);
    const buffer = await audioData.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // Transcribe with Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      language: 'en',
      temperature: 0.0,
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Update recording with transcript
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcript: transcription.text,
        transcript_status: 'completed',
        duration_seconds: Math.floor(transcription.duration || 0),
      })
      .eq('id', recordingId);

    if (updateError) throw updateError;

    return { success: true, transcript: transcription.text };
  } catch (error) {
    console.error('Groq transcription error:', error);

    await supabase
      .from('recordings')
      .update({ transcript_status: 'failed' })
      .eq('id', recordingId);

    throw error;
  }
}
```

### 3.2 Create Transcription API Route

**File**: `app/api/sessions/transcribe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/actions/transcribe-groq';

export async function POST(req: NextRequest) {
  try {
    const { recordingId } = await req.json();

    // Run transcription in background
    transcribeAudio(recordingId).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transcription trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to start transcription' },
      { status: 500 }
    );
  }
}
```

### 3.3 Create Processing API Route (for Daily.co recordings)

**File**: `app/api/sessions/[id]/process-recording/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { recordingId } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Daily.co recording download URL
    const response = await fetch(`https://api.daily.co/v1/recordings/${recordingId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
      },
    });

    const recordingData = await response.json();

    if (recordingData.download_link) {
      // Download the recording
      const audioResponse = await fetch(recordingData.download_link);
      const audioBuffer = await audioResponse.arrayBuffer();

      // Upload to Supabase Storage
      const fileName = `${sessionId}_${Date.now()}.mp4`;
      const filePath = `${user.id}/${sessionId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(filePath, audioBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Save recording metadata
      const { data: recording, error: dbError } = await supabase
        .from('recordings')
        .insert({
          session_id: sessionId,
          file_path: uploadData.path,
          file_size_bytes: audioBuffer.byteLength,
          transcript_status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger transcription
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sessions/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId: recording.id }),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No download link available' }, { status: 400 });
  } catch (error) {
    console.error('Process recording error:', error);
    return NextResponse.json(
      { error: 'Failed to process recording' },
      { status: 500 }
    );
  }
}
```

### 3.4 Create Transcript Viewer Component

**File**: `components/sessions/transcript-viewer.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Copy, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptViewerProps {
  transcript: string;
  recordingId: string;
  onUpdate?: (newTranscript: string) => void;
}

export function TranscriptViewer({ transcript, recordingId, onUpdate }: TranscriptViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast.success('Transcript copied to clipboard');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/recordings/update-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId, transcript: editedTranscript }),
      });

      if (!response.ok) throw new Error('Failed to update');

      onUpdate?.(editedTranscript);
      setIsEditing(false);
      toast.success('Transcript updated');
    } catch (error) {
      toast.error('Failed to update transcript');
    }
  };

  return (
    <Card className="rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Transcript
          </CardTitle>
          <p className="text-sm text-slate-500">AI-generated transcript of the session</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setEditedTranscript(transcript);
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="min-h-[300px] rounded-2xl border bg-white/80"
            style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}
          />
        ) : (
          <div
            className="rounded-2xl border bg-white/70 p-4 whitespace-pre-wrap text-sm text-slate-700 max-h-[400px] overflow-y-auto"
            style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}
          >
            {transcript}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🤖 Phase 4: AI Summary with Groq LLaMA

### 4.1 Add Summary Fields to Database

Run this SQL in Supabase SQL Editor:

```sql
-- Add summary fields to recordings table
ALTER TABLE recordings 
ADD COLUMN summary TEXT,
ADD COLUMN summary_status TEXT DEFAULT 'pending' 
  CHECK (summary_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create index for summary status
CREATE INDEX idx_recordings_summary_status ON recordings(summary_status);
```

### 4.2 Create Summary Generation Server Action

**File**: `lib/actions/generate-summary.ts`

```typescript
'use server';

import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateSummary(recordingId: string) {
  const supabase = await createClient();

  try {
    // Get recording with transcript
    const { data: recording, error: fetchError } = await supabase
      .from('recordings')
      .select('transcript')
      .eq('id', recordingId)
      .single();

    if (fetchError) throw fetchError;

    if (!recording.transcript) {
      throw new Error('No transcript available');
    }

    // Update status to processing
    await supabase
      .from('recordings')
      .update({ summary_status: 'processing' })
      .eq('id', recordingId);

    // Generate summary using Groq LLaMA
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile', // or 'llama-3.1-8b-instant' for faster processing
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping therapists summarize therapy sessions. 
Analyze the transcript and provide:
1. A brief overview (2-3 sentences)
2. Key themes discussed
3. Client's emotional state and progress
4. Action items or homework assigned
5. Important insights or breakthroughs

Keep it professional, empathetic, and focused on therapeutic value.
Format your response in clear sections with headers.`
        },
        {
          role: 'user',
          content: `Please summarize this therapy session transcript:\n\n${recording.transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const summary = completion.choices[0]?.message?.content || '';

    // Update recording with summary
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        summary,
        summary_status: 'completed',
      })
      .eq('id', recordingId);

    if (updateError) throw updateError;

    return { success: true, summary };
  } catch (error) {
    console.error('Summary generation error:', error);

    await supabase
      .from('recordings')
      .update({ summary_status: 'failed' })
      .eq('id', recordingId);

    throw error;
  }
}
```

### 4.3 Create Summary API Route

**File**: `app/api/sessions/generate-summary/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/actions/generate-summary';

export async function POST(req: NextRequest) {
  try {
    const { recordingId } = await req.json();

    // Run summary generation
    const result = await generateSummary(recordingId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Summary generation trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
```

### 4.4 Create Session Summary Component

**File**: `components/sessions/session-summary.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SessionSummaryProps {
  summary: string;
  recordingId: string;
  summaryStatus: string;
  onRegenerate?: () => void;
}

export function SessionSummary({ 
  summary, 
  recordingId, 
  summaryStatus,
  onRegenerate 
}: SessionSummaryProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/sessions/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId }),
      });

      if (!response.ok) throw new Error('Failed to regenerate');

      toast.success('Summary regenerated');
      onRegenerate?.();
    } catch (error) {
      toast.error('Failed to regenerate summary');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (summaryStatus === 'processing') {
    return (
      <Card className="rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-600">Generating AI summary...</p>
        </CardContent>
      </Card>
    );
  }

  if (summaryStatus === 'failed') {
    return (
      <Card className="rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-rose-600">Failed to generate summary</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 rounded-xl"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Summary
          </CardTitle>
          <p className="text-sm text-slate-500">Key insights from this session</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-2xl border bg-gradient-to-br from-purple-50 to-pink-50 p-6 prose prose-sm max-w-none"
          style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}
        >
          <div className="whitespace-pre-wrap text-slate-700">
            {summary}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4.5 Auto-trigger Summary After Transcription

Update the transcription server action to trigger summary:

```typescript
// In lib/actions/transcribe-groq.ts, after successful transcription:

// Trigger summary generation
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sessions/generate-summary`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recordingId }),
}).catch(console.error);
```

---

## 🎵 Phase 5: Audio Playback

### 5.1 Create Audio Player Component

**File**: `components/sessions/audio-player.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Download, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  fileUrl: string;
  fileName: string;
}

export function AudioPlayer({ fileUrl, fileName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(fileUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.remove();
    };
  }, [fileUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.click();
  };

  return (
    <Card className="rounded-3xl border shadow-sm" style={{ borderColor: 'rgba(120, 57, 238, 0.18)' }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">Recording</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={skipBackward}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={skipForward}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume & Speed */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="h-4 w-4 text-slate-500" />
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
            />
          </div>

          <div className="flex gap-1">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? 'default' : 'outline'}
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => handlePlaybackRateChange(rate)}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.2 Create Slider Component (if not exists)

```bash
npx shadcn@latest add slider
```

---

## 🔗 Integration: Update Session Detail Page

Update `app/(dashboard)/dashboard/sessions/[id]/page.tsx` to show all new features:

```typescript
// Add imports
import { VideoCall } from '@/components/sessions/video-call';
import { AudioPlayer } from '@/components/sessions/audio-player';
import { TranscriptViewer } from '@/components/sessions/transcript-viewer';
import { SessionSummary } from '@/components/sessions/session-summary';

// Add state
const [showVideoCall, setShowVideoCall] = useState(false);

// In the Recording section - show video call when session is in progress:
{session.status === 'in_progress' && showVideoCall && (
  <VideoCall 
    roomUrl={session.daily_room_url} 
    sessionId={session.id}
    onCallEnd={() => {
      setShowVideoCall(false);
      handleStatusChange('completed');
    }}
  />
)}

{session.recordings?.[0] && (
  <>
    <AudioPlayer 
      fileUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio-recordings/${session.recordings[0].file_path}`}
      fileName={session.recordings[0].file_path}
    />
    
    {session.recordings[0].transcript && (
      <TranscriptViewer 
        transcript={session.recordings[0].transcript}
        recordingId={session.recordings[0].id}
      />
    )}

    {session.recordings[0].summary && (
      <SessionSummary 
        summary={session.recordings[0].summary}
        recordingId={session.recordings[0].id}
        summaryStatus={session.recordings[0].summary_status}
      />
    )}
  </>
)}
```

---

## 📋 Complete Implementation Checklist

### Setup & Configuration
- [ ] Install `@daily-co/daily-js @daily-co/daily-react groq-sdk`
- [ ] Add `DAILY_API_KEY` to `.env.local`
- [ ] Add `GROQ_API_KEY` to `.env.local`
- [ ] Test API connections

### Database Updates
- [ ] Add summary fields to recordings table (SQL migration)
- [ ] Verify all indexes are created

### Video Calling (Daily.co)
- [ ] Create `/api/daily/create-room` route
- [ ] Build `VideoCall` component
- [ ] Integrate into session detail page
- [ ] Add "Start Video Call" button
- [ ] Test video call end-to-end

### Transcription (Groq Whisper)
- [ ] Create `transcribe-groq.ts` server action
- [ ] Create `/api/sessions/transcribe` route
- [ ] Create `/api/sessions/[id]/process-recording` route
- [ ] Build `TranscriptViewer` component
- [ ] Test transcription with sample audio

### Summary (Groq LLaMA)
- [ ] Create `generate-summary.ts` server action
- [ ] Create `/api/sessions/generate-summary` route
- [ ] Build `SessionSummary` component
- [ ] Add auto-trigger after transcription
- [ ] Test summary generation

### Audio Playback
- [ ] Install slider component if needed
- [ ] Create `AudioPlayer` component
- [ ] Test playback controls
- [ ] Test download functionality

### Final Integration
- [ ] Update session detail page with all components
- [ ] Test complete workflow:
  - Schedule session
  - Start Daily.co video call → record → transcribe → summarize
  - End call and review recording, transcript, and summary
- [ ] Handle error states and loading states
- [ ] Add proper error messages and user feedback

---

## ⏱️ Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup & Dependencies | 1-2 hours |
| 2 | Video Calling (Daily.co) | 4-6 hours |
| 3 | Transcription (Groq Whisper) | 3-4 hours |
| 4 | Summary (Groq LLaMA) | 2-3 hours |
| 5 | Audio Playback | 2 hours |
| 6 | Integration & Testing | 2-3 hours |
| **Total** | | **14-20 hours** |

---

## 🔑 Key Technical Details

### Groq Models Used

**For Transcription:**
- Model: `whisper-large-v3`
- Speed: ~2 minutes per hour of audio
- Accuracy: Same as OpenAI Whisper Large v3
- Cost: Free tier with rate limits

**For Summary:**
- Model: `llama-3.1-70b-versatile` (recommended)
- Alternative: `llama-3.1-8b-instant` (faster, less detailed)
- Speed: ~5-10 seconds per summary
- Cost: Free tier with rate limits

### Daily.co Configuration
- Free tier: 10,000 minutes/month
- Cloud recording automatically saved
- 2-hour session expiry
- HIPAA-compliant option available (paid)

### File Storage
- Path structure: `{user_id}/{session_id}/{filename}`
- Formats: WebM, MP4 (from Daily.co), MP3
- RLS policies ensure data isolation

---

## 🚀 Next Steps After Implementation

1. **Test thoroughly** with real sessions
2. **Monitor Groq usage** and rate limits
3. **Optimize file sizes** if approaching storage limits
4. **Add notifications** when transcription/summary complete
5. **Consider HIPAA compliance** if needed for production
6. **Add export features** (PDF reports, etc.)
7. **Implement search** across transcripts

---

## 📚 Helpful Resources

- [Daily.co React Documentation](https://docs.daily.co/reference/daily-react)
- [Groq API Documentation](https://console.groq.com/docs)
- [Groq LLaMA Models](https://console.groq.com/docs/models)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

---

**Ready to start implementation!** 🎉
