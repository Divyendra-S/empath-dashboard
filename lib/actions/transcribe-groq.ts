"use server";

import Groq from "groq-sdk";
import { createServerClientA as createClient } from "@/lib/supabase/server-a";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { tmpdir } from "os";
import { validateTranscript } from "@/lib/utils/transcription-validator";

// Ensure this runs in Node.js runtime
export const runtime = "nodejs";

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
    await fs.writeFile(tempFilePath, Buffer.from(buffer));

    // Transcribe with Groq Whisper with strict prompt to prevent hallucination
    const transcription = (await groq.audio.transcriptions.create({
      file: fsSync.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      response_format: "verbose_json",
      language: "en",
      temperature: 0.0,
      prompt:
        "Transcribe only the actual spoken words in this audio. If there is no clear speech or only silence, return an empty transcript. Do not add any content that was not actually spoken.",
    })) as VerboseTranscription;

    // Clean up temp file
    await fs.unlink(tempFilePath);

    // Validate transcript to detect and filter hallucinations
    const validation = validateTranscript(
      transcription.text,
      transcription.duration
    );

    // Use cleaned transcript if validation found issues
    const finalTranscript = validation.cleanedTranscript || transcription.text;

    // Log validation issues for monitoring
    if (validation.issues.length > 0) {
      console.warn(
        `Transcription validation issues for recording ${recordingId}:`,
        {
          confidence: validation.confidence,
          issues: validation.issues,
          originalLength: transcription.text.length,
          cleanedLength: finalTranscript.length,
        }
      );
    }

    // Update recording with validated transcript
    const { error: updateError } = await supabase
      .from("recordings")
      .update({
        transcript: finalTranscript,
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

    return {
      success: true,
      transcript: finalTranscript,
      validation: {
        isValid: validation.isValid,
        confidence: validation.confidence,
        hadIssues: validation.issues.length > 0,
      },
    };
  } catch (error) {
    console.error("Groq transcription error:", error);

    await supabase
      .from("recordings")
      .update({ transcript_status: "failed" })
      .eq("id", recordingId);

    throw error;
  }
}
