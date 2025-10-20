"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Copy, Edit, Save, X, User } from "lucide-react";
import { toast } from "sonner";

interface Message {
  speaker: string;
  text: string;
  isTherapist: boolean;
}

interface ConversationTranscriptProps {
  transcript: string;
  recordingId: string;
  clientName?: string;
  onUpdate?: () => void;
}

function parseTranscript(transcript: string): Message[] {
  const lines = transcript.split("\n").filter((line) => line.trim());
  const messages: Message[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Skip common LLM-added header/footer phrases and explanatory text
    if (
      trimmedLine.toLowerCase().includes("here is the formatted transcript") ||
      trimmedLine.toLowerCase().includes("formatted transcript:") ||
      trimmedLine.toLowerCase().includes("here is the conversation") ||
      trimmedLine.toLowerCase().includes("output:") ||
      trimmedLine.toLowerCase().startsWith("note:") ||
      trimmedLine.toLowerCase().startsWith("please note") ||
      trimmedLine.toLowerCase().includes("upon closer inspection") ||
      trimmedLine.toLowerCase().includes("let's reevaluate") ||
      trimmedLine.toLowerCase().includes("a more plausible") ||
      trimmedLine.toLowerCase().includes("a more accurate") ||
      trimmedLine.toLowerCase().includes("here is the final version") ||
      trimmedLine.toLowerCase().includes("final version:") ||
      trimmedLine.toLowerCase().includes("corrected version:") ||
      /^[*#-]+$/.test(trimmedLine) // Skip separator lines
    ) {
      continue;
    }

    // Check if line contains a speaker label (Name: text)
    const match = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [, speaker, text] = match;
      const speakerName = speaker.trim();

      // Skip if this looks like a label or instruction rather than actual speech
      if (
        speakerName.toLowerCase().includes("this is unlikely") ||
        text.toLowerCase().includes("this is unlikely")
      ) {
        continue;
      }

      // Determine if this is likely the therapist
      // Therapist names often contain numbers or are emails
      const isTherapist = /\d/.test(speakerName) || speakerName.includes("@");

      messages.push({
        speaker: speakerName,
        text: text.trim(),
        isTherapist,
      });
    } else {
      // If no speaker found, skip lines that don't look like conversation
      // (This prevents adding non-conversation text)
      if (
        messages.length > 0 &&
        !trimmedLine.toLowerCase().includes("version")
      ) {
        // Append to last message only if it looks like a continuation
        messages[messages.length - 1].text += " " + trimmedLine;
      }
    }
  }

  return messages;
}

export function ConversationTranscript({
  transcript,
  recordingId,
  onUpdate,
}: ConversationTranscriptProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const messages = parseTranscript(transcript);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast.success("Transcript copied to clipboard");
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/recordings/update-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId, transcript: editedTranscript }),
      });

      if (!response.ok) throw new Error("Failed to update");

      onUpdate?.();
      setIsEditing(false);
      toast.success("Transcript updated");
    } catch {
      toast.error("Failed to update transcript");
    }
  };

  return (
    <Card
      className="rounded-3xl border shadow-sm"
      style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Session Conversation
          </CardTitle>
          <p className="text-sm text-slate-500">
            {isEditing
              ? "Edit the transcript text"
              : "AI-generated conversation transcript"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleCopy}
            disabled={isEditing}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button size="sm" className="rounded-xl" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setEditedTranscript(transcript);
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="min-h-[400px] rounded-2xl border bg-white/80 font-mono text-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
        ) : (
          <div
            className="rounded-2xl border bg-white/70 p-6 max-h-[600px] overflow-y-auto space-y-4"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No conversation to display
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isTherapist ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.isTherapist ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        message.isTherapist
                          ? "bg-[var(--theme-primary-hex)] text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {message.isTherapist ? (
                        <User className="h-5 w-5" />
                      ) : (
                        message.speaker.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`flex flex-col ${
                        message.isTherapist ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span
                          className={`text-xs font-semibold ${
                            message.isTherapist
                              ? "text-[var(--theme-primary-hex)]"
                              : "text-slate-600"
                          }`}
                        >
                          {message.isTherapist ? "You" : message.speaker}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.isTherapist
                            ? "text-white rounded-tr-sm"
                            : "bg-white border text-slate-800 rounded-tl-sm"
                        }`}
                        style={
                          message.isTherapist
                            ? {
                                backgroundColor: "var(--theme-primary-hex)",
                                borderColor: "rgba(120, 57, 238, 0.18)",
                              }
                            : { borderColor: "rgba(120, 57, 238, 0.18)" }
                        }
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
