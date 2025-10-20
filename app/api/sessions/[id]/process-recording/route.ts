import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { recordingId } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Daily.co recording download URL
    const response = await fetch(
      `https://api.daily.co/v1/recordings/${recordingId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      }
    );

    const recordingData = await response.json();

    if (recordingData.download_link) {
      // Download the recording
      const audioResponse = await fetch(recordingData.download_link);
      const audioBuffer = await audioResponse.arrayBuffer();

      // Upload to Supabase Storage
      const fileName = `${sessionId}_${Date.now()}.mp4`;
      const filePath = `${user.id}/${sessionId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio-recordings")
        .upload(filePath, audioBuffer, {
          contentType: "video/mp4",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Save recording metadata
      const { data: recording, error: dbError } = await supabase
        .from("recordings")
        .insert({
          session_id: sessionId,
          file_path: uploadData.path,
          file_size_bytes: audioBuffer.byteLength,
          transcript_status: "pending",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger transcription via Supabase Edge Function
      // This runs independently on Supabase infrastructure
      // and will continue even if Next.js app is offline
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/transcribe-recording`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ recordingId: recording.id }),
      }).catch((err) => console.error("Failed to trigger transcription:", err));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "No download link available" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Process recording error:", error);
    return NextResponse.json(
      { error: "Failed to process recording" },
      { status: 500 }
    );
  }
}
