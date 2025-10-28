import { NextRequest, NextResponse } from "next/server";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recordingId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recording details
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("file_path, session_id")
      .eq("id", recordingId)
      .single();

    if (fetchError || !recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this recording (through session ownership)
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("therapist_id")
      .eq("id", recording.session_id)
      .single();

    if (sessionError || !session || session.therapist_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("audio-recordings")
        .createSignedUrl(recording.file_path, 3600); // 1 hour

    if (signedUrlError || !signedUrlData) {
      console.error("Failed to create signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate audio URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error("Get audio URL error:", error);
    return NextResponse.json(
      { error: "Failed to get audio URL" },
      { status: 500 }
    );
  }
}
