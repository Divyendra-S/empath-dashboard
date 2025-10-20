"use client";

import { use, useEffect, useState } from "react";
import { VideoCall } from "@/components/sessions/video-call";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2 } from "lucide-react";

export default function JoinSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    // Fetch room URL for this session
    const fetchRoomUrl = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/room-url`);
        if (!response.ok) throw new Error("Session not found");

        const data = await response.json();
        setRoomUrl(data.roomUrl);
      } catch (err) {
        setError("Session not found or not available");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomUrl();
  }, [sessionId]);

  const handleJoin = () => {
    if (clientName.trim()) {
      setHasJoined(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border shadow-lg">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-sm text-slate-600">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !roomUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-rose-200 border shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-rose-500 mb-4">
              <Video className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">Session Not Available</p>
            </div>
            <p className="text-sm text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card
          className="max-w-md w-full rounded-3xl border shadow-lg"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Join Therapy Session
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Your therapist is waiting for you
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={!clientName.trim()}
              className="w-full rounded-xl py-6 text-base font-semibold"
              size="lg"
            >
              Join Session
            </Button>
            <p className="text-xs text-slate-400 text-center">
              By joining, you allow camera and microphone access
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <VideoCall
        roomUrl={roomUrl}
        sessionId={sessionId}
        onCallEnd={() => {
          window.location.href = "/";
        }}
        isFullScreen={true}
      />
    </div>
  );
}
