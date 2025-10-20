"use client";

import { useEffect, useState, useRef } from "react";
import {
  useDaily,
  useRecording,
  DailyProvider,
  useParticipantIds,
  useVideoTrack,
} from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  XCircle,
  Maximize,
} from "lucide-react";
import { AudioRecorder } from "@/lib/audio-recorder";
import { toast } from "sonner";

interface VideoCallProps {
  roomUrl: string;
  sessionId: string;
  onCallEnd?: () => void;
  isFullScreen?: boolean;
}

function VideoTile({ sessionId }: { sessionId: string }) {
  const videoState = useVideoTrack(sessionId);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden">
      <video
        autoPlay
        muted={sessionId === "local"}
        playsInline
        ref={(ref) => {
          if (ref && videoState.persistentTrack) {
            ref.srcObject = new MediaStream([videoState.persistentTrack]);
          }
        }}
        className="w-full h-full object-cover"
      />
      {!videoState.persistentTrack && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">
                {sessionId === "local" ? "You" : "Guest"}
              </span>
            </div>
            <p className="text-sm text-slate-400">Camera off</p>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoCallContent({
  roomUrl,
  sessionId,
  onCallEnd,
  isFullScreen,
}: VideoCallProps) {
  const daily = useDaily();
  const { startRecording, stopRecording, isRecording } = useRecording();
  const participantIds = useParticipantIds();
  const [joined, setJoined] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(isFullScreen || false);
  const [isLocalRecording, setIsLocalRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!daily) {
      console.log("⏳ Daily object not ready yet...");
      return;
    }

    console.log("🎥 Starting to join Daily.co room:", roomUrl);

    const join = async () => {
      try {
        console.log("📞 Attempting to join call...");
        const joinResult = await daily.join({ url: roomUrl });
        console.log("✅ Join successful!", joinResult);
        setJoined(true);

        // Auto-start recording (only if cloud recording is enabled in Daily.co plan)
        try {
          console.log("🔴 Attempting to start recording...");
          await startRecording();
          console.log("✅ Recording started!");
        } catch (recordError) {
          console.log(
            "ℹ️ Recording not available (requires Daily.co Developer plan):",
            recordError
          );
        }

        // Start local audio recording
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          audioRecorderRef.current = new AudioRecorder();
          await audioRecorderRef.current.startRecording(localStream);
          setIsLocalRecording(true);

          // Start duration counter
          durationIntervalRef.current = setInterval(() => {
            setRecordingDuration((prev) => prev + 1);
          }, 1000);

          console.log("🎙️ Local audio recording started");
        } catch (recordError) {
          console.error("Failed to start local recording:", recordError);
          toast.error("Failed to start audio recording");
        }
      } catch (error) {
        console.error("❌ Failed to join call:", error);
        setError(
          error instanceof Error ? error.message : "Failed to join call"
        );
      }
    };

    join();

    // Handle recording events
    daily.on("recording-stopped", async (event) => {
      console.log("Recording stopped:", event);
      // Trigger processing
      await fetch(`/api/sessions/${sessionId}/process-recording`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId: event.instanceId }),
      });
    });

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      daily.leave();
      daily.destroy();
    };
  }, [daily, roomUrl, sessionId, startRecording]);

  const toggleVideo = () => {
    if (daily) {
      daily.setLocalVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (daily) {
      daily.setLocalAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const endCall = async () => {
    if (daily) {
      // Stop cloud recording if running
      if (isRecording) {
        await stopRecording();
      }

      // Stop local audio recording and upload
      if (audioRecorderRef.current && isLocalRecording) {
        try {
          console.log("⏹️ Stopping local recording...");
          const audioBlob = await audioRecorderRef.current.stopRecording();
          setIsLocalRecording(false);

          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }

          // Upload to server
          console.log("📤 Uploading recording...");
          toast.info("Uploading recording...");

          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const response = await fetch(
            `/api/sessions/${sessionId}/upload-recording`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log("✅ Recording uploaded:", result);
            toast.success("Recording uploaded! Transcription started.");
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          console.error("Failed to upload recording:", error);
          toast.error("Failed to upload recording");
        }
      }

      await daily.leave();
      onCallEnd?.();
    }
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="font-semibold">Failed to join call</p>
          </div>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-600">Joining call...</p>
          <p className="text-xs text-slate-400 mt-2">
            Please allow camera and microphone access
          </p>
        </div>
      </div>
    );
  }

  const localParticipant = participantIds.find((id) => id === "local");
  const remoteParticipants = participantIds.filter((id) => id !== "local");

  return (
    <div
      className={
        fullScreen ? "fixed inset-0 z-50 bg-slate-950 p-6" : "space-y-4"
      }
    >
      {/* Video Grid */}
      <div
        className={`relative ${
          fullScreen ? "h-[calc(100vh-120px)]" : "aspect-video"
        } bg-slate-900 rounded-2xl overflow-hidden`}
      >
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns:
              remoteParticipants.length > 0
                ? "repeat(auto-fit, minmax(300px, 1fr))"
                : "1fr",
          }}
        >
          {/* Local participant */}
          {localParticipant && <VideoTile sessionId={localParticipant} />}

          {/* Remote participants */}
          {remoteParticipants.map((id) => (
            <VideoTile key={id} sessionId={id} />
          ))}
        </div>

        {/* Recording Indicator */}
        {(isRecording || isLocalRecording) && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}

        {/* Full Screen Toggle */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full z-10"
          onClick={toggleFullScreen}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div
        className={
          fullScreen
            ? "fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 p-6 z-50"
            : "bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4"
        }
      >
        {/* Recording Status */}
        {isLocalRecording && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording: {Math.floor(recordingDuration / 60)}:
              {(recordingDuration % 60).toString().padStart(2, "0")}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={videoEnabled ? "secondary" : "destructive"}
            size="lg"
            className="rounded-xl min-w-[120px] bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={toggleVideo}
          >
            {videoEnabled ? (
              <>
                <Video className="h-5 w-5 mr-2" />
                Video
              </>
            ) : (
              <>
                <VideoOff className="h-5 w-5 mr-2" />
                Video Off
              </>
            )}
          </Button>

          <Button
            variant={audioEnabled ? "secondary" : "destructive"}
            size="lg"
            className="rounded-xl min-w-[120px] bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={toggleAudio}
          >
            {audioEnabled ? (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Audio
              </>
            ) : (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Muted
              </>
            )}
          </Button>

          <Button
            size="lg"
            className="rounded-xl min-w-[140px] bg-red-500 hover:bg-red-600 text-white"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VideoCall(props: VideoCallProps) {
  return (
    <DailyProvider>
      <VideoCallContent {...props} />
    </DailyProvider>
  );
}
