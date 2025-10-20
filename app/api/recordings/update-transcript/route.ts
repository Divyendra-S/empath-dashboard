import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { recordingId, transcript } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update transcript
    const { error } = await supabase
      .from("recordings")
      .update({ transcript })
      .eq("id", recordingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update transcript error:", error);
    return NextResponse.json(
      { error: "Failed to update transcript" },
      { status: 500 }
    );
  }
}
