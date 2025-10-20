"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Copy, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

interface TranscriptViewerProps {
  transcript: string;
  recordingId: string;
  onUpdate?: (newTranscript: string) => void;
}

export function TranscriptViewer({
  transcript,
  recordingId,
  onUpdate,
}: TranscriptViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

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

      onUpdate?.(editedTranscript);
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
            <FileText className="h-5 w-5 text-purple-500" />
            Transcript
          </CardTitle>
          <p className="text-sm text-slate-500">
            AI-generated transcript of the session
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleCopy}
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
            className="min-h-[300px] rounded-2xl border bg-white/80"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          />
        ) : (
          <div
            className="rounded-2xl border bg-white/70 p-4 whitespace-pre-wrap text-sm text-slate-700 max-h-[400px] overflow-y-auto"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            {transcript}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
