"use server";

import Groq from "groq-sdk";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateSummary(recordingId: string) {
  const supabase = await createClient();

  try {
    // Get recording with transcript
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("transcript")
      .eq("id", recordingId)
      .single();

    if (fetchError) throw fetchError;

    if (!recording.transcript) {
      throw new Error("No transcript available");
    }

    // Update status to processing
    await supabase
      .from("recordings")
      .update({ summary_status: "processing" })
      .eq("id", recordingId);

    // Generate summary using Groq LLaMA
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile", // or 'llama-3.1-8b-instant' for faster processing
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping therapists summarize therapy sessions. 
Analyze the transcript and provide:
1. A brief overview (2-3 sentences)
2. Key themes discussed
3. Client's emotional state and progress
4. Action items or homework assigned
5. Important insights or breakthroughs

Keep it professional, empathetic, and focused on therapeutic value.
Format your response in clear sections with headers.`,
        },
        {
          role: "user",
          content: `Please summarize this therapy session transcript:\n\n${recording.transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const summary = completion.choices[0]?.message?.content || "";

    // Update recording with summary
    const { error: updateError } = await supabase
      .from("recordings")
      .update({
        summary,
        summary_status: "completed",
      })
      .eq("id", recordingId);

    if (updateError) throw updateError;

    return { success: true, summary };
  } catch (error) {
    console.error("Summary generation error:", error);

    await supabase
      .from("recordings")
      .update({ summary_status: "failed" })
      .eq("id", recordingId);

    throw error;
  }
}
