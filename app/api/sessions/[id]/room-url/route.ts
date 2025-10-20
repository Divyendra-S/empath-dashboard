import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    const supabase = await createClient();

    // Fetch session (no auth required for public join)
    const { data: session, error } = await supabase
      .from("sessions")
      .select("daily_room_url, status")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if session is in progress or scheduled
    if (session.status === "completed" || session.status === "cancelled") {
      return NextResponse.json(
        { error: "Session is no longer available" },
        { status: 400 }
      );
    }

    if (!session.daily_room_url) {
      return NextResponse.json(
        { error: "Video call not started yet" },
        { status: 400 }
      );
    }

    return NextResponse.json({ roomUrl: session.daily_room_url });
  } catch (error) {
    console.error("Get room URL error:", error);
    return NextResponse.json(
      { error: "Failed to get room URL" },
      { status: 500 }
    );
  }
}
