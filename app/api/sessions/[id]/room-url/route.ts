import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Add CORS headers for mobile browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    console.log(`[Room URL] Fetching room URL for session: ${sessionId}`);

    // Use server client with anon key (works without authentication)
    const supabase = await createClient();

    // Fetch session (no auth required for public join)
    // This uses the anon key which has read access to sessions table
    const { data: session, error } = await supabase
      .from("sessions")
      .select("daily_room_url, status")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error(
        `[Room URL] Database error for session ${sessionId}:`,
        error
      );
      return NextResponse.json(
        { error: "Session not found", details: error.message },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!session) {
      console.warn(`[Room URL] No session found with ID: ${sessionId}`);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if session is in progress or scheduled
    if (session.status === "completed" || session.status === "cancelled") {
      console.warn(
        `[Room URL] Session ${sessionId} has status: ${session.status}`
      );
      return NextResponse.json(
        {
          error: "Session is no longer available",
          status: session.status,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!session.daily_room_url) {
      console.warn(`[Room URL] No room URL found for session: ${sessionId}`);
      return NextResponse.json(
        { error: "Video call not started yet" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(
      `[Room URL] Successfully retrieved room URL for session: ${sessionId}`
    );
    return NextResponse.json(
      { roomUrl: session.daily_room_url },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Get room URL error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to get room URL",
        details: errorMessage,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
