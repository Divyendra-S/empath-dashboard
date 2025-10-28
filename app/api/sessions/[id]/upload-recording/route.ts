import { NextRequest, NextResponse } from "next/server";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get audio blob from FormData
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert blob to buffer for upload
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${sessionId}_${Date.now()}.webm`;
    const filePath = `${user.id}/${sessionId}/${fileName}`;

    console.log(
      `📤 Uploading recording: ${filePath}, size: ${buffer.length} bytes`
    );

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(filePath, buffer, {
        contentType: "audio/webm",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("✅ Upload successful:", uploadData);

    // Create recording record in database
    const { data: recording, error: dbError } = await supabase
      .from("recordings")
      .insert({
        session_id: sessionId,
        file_path: uploadData.path,
        file_size_bytes: buffer.length,
        transcript_status: "pending",
        summary_status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log("✅ Recording record created:", recording.id);

    // Trigger transcription via Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("🚀 Triggering transcription for recording:", recording.id);

    fetch(`${supabaseUrl}/functions/v1/transcribe-recording`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ recordingId: recording.id }),
    }).catch((err) => console.error("Failed to trigger transcription:", err));

    return NextResponse.json({
      success: true,
      recordingId: recording.id,
      message: "Recording uploaded successfully. Transcription started.",
    });
  } catch (error) {
    console.error("Upload recording error:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}
