import { NextRequest, NextResponse } from "next/server";
import { createServiceClientB } from "@/lib/supabase/server-b";

// GET /api/sessions-b - Fetch sessions from Project B
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabaseB = createServiceClientB();

    let query = supabaseB
      .from("sessions")
      .select("id, user_id, start_time, end_time, status, summary, recording_url, session_type")
      .order("start_time", { ascending: false })
      .limit(limit);

    // Filter by user_id if provided
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error("Error fetching sessions from Project B:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
