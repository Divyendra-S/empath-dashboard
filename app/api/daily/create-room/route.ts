import { NextRequest, NextResponse } from "next/server";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Daily.co room
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `session-${sessionId}`,
        privacy: "public", // Changed from "private" - private rooms require meeting tokens
        properties: {
          // Note: Cloud recording requires Daily.co Developer plan ($9/month)
          // enable_recording: "cloud",
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
      console.error("Daily.co API error:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(
        data.error || data.info || `Failed to create room: ${response.status}`
      );
    }

    // Save room details to session
    await supabase
      .from("sessions")
      .update({
        daily_room_url: data.url,
        daily_room_name: data.name,
      })
      .eq("id", sessionId)
      .eq("therapist_id", user.id);

    return NextResponse.json({
      roomUrl: data.url,
      roomName: data.name,
    });
  } catch (error) {
    console.error("Failed to create Daily.co room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
