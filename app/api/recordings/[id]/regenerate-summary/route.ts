import { NextRequest, NextResponse } from "next/server";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";

export async function POST(
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

    // Verify recording exists and user has access
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("session_id, transcript")
      .eq("id", recordingId)
      .single();

    if (fetchError || !recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    if (!recording.transcript) {
      return NextResponse.json(
        {
          error: "No transcript available. Transcription must complete first.",
        },
        { status: 400 }
      );
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("therapist_id")
      .eq("id", recording.session_id)
      .single();

    if (sessionError || !session || session.therapist_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reset summary status
    await supabase
      .from("recordings")
      .update({ summary_status: "pending", summary: null })
      .eq("id", recordingId);

    // Trigger summary generation Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-summary`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ recordingId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Edge Function failed");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Summary generation triggered",
      result,
    });
  } catch (error) {
    console.error("Regenerate summary error:", error);
    return NextResponse.json(
      {
        error: "Failed to regenerate summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
