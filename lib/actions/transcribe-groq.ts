"use server";

import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";

// Groq Whisper response with verbose_json format
interface VerboseTranscription {
  text: string;
  duration?: number;
  language?: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function transcribeAudio(recordingId: string) {
  const supabase = await createClient();

  try {
    // Get recording details
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("file_path, session_id")
      .eq("id", recordingId)
      .single();

    if (fetchError) throw fetchError;

    // Update status to processing
    await supabase
      .from("recordings")
      .update({ transcript_status: "processing" })
      .eq("id", recordingId);

    // Download audio from Supabase Storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("audio-recordings")
      .download(recording.file_path);

    if (downloadError) throw downloadError;

    // Save to temp file
    const tempFilePath = path.join(tmpdir(), `audio-${recordingId}.mp4`);
    const buffer = await audioData.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // Transcribe with Groq Whisper
    const transcription = (await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "verbose_json",
      language: "en",
      temperature: 0.0,
    })) as VerboseTranscription;

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Update recording with transcript
    const { error: updateError } = await supabase
      .from("recordings")
      .update({
        transcript: transcription.text,
        transcript_status: "completed",
        duration_seconds: Math.floor(transcription.duration || 0),
      })
      .eq("id", recordingId);

    if (updateError) throw updateError;

    // Trigger summary generation
    await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/sessions/generate-summary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId }),
      }
    ).catch(console.error);

    return { success: true, transcript: transcription.text };
  } catch (error) {
    console.error("Groq transcription error:", error);

    await supabase
      .from("recordings")
      .update({ transcript_status: "failed" })
      .eq("id", recordingId);

    throw error;
  }
}
