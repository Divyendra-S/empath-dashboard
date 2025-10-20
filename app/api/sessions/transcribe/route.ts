import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { recordingId } = await req.json();

    // Trigger Supabase Edge Function for transcription
    // This is more reliable as it runs on Supabase infrastructure
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await fetch(`${supabaseUrl}/functions/v1/transcribe-recording`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ recordingId }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transcription trigger error:", error);
    return NextResponse.json(
      { error: "Failed to start transcription" },
      { status: 500 }
    );
  }
}
