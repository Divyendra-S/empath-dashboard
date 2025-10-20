"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  FileText,
  NotebookPen,
  Play,
  Trash2,
  User,
  Video,
  XCircle,
  Edit,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSession,
  useUpdateSessionStatus,
  useDeleteSession,
} from "@/lib/hooks/use-sessions";
import type { SessionStatus } from "@/lib/types";
import { themeConfig } from "@/lib/theme";
import { VideoCall } from "@/components/sessions/video-call";
import { AudioPlayer } from "@/components/sessions/audio-player";
import { TranscriptViewer } from "@/components/sessions/transcript-viewer";
import { SessionSummary } from "@/components/sessions/session-summary";
import { toast } from "sonner";

const statusLabels: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: session, isLoading, error, refetch } = useSession(id);
  const updateStatus = useUpdateSessionStatus();
  const deleteSession = useDeleteSession();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Fetch signed audio URL when recording is available
  useEffect(() => {
    if (session?.recordings?.[0]?.id) {
      fetch(`/api/recordings/${session.recordings[0].id}/audio-url`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setAudioUrl(data.url);
          }
        })
        .catch((err) => console.error("Failed to fetch audio URL:", err));
    }
  }, [session?.recordings?.[0]?.id]);

  const handleStatusChange = async (status: SessionStatus) => {
    await updateStatus.mutateAsync({ id, status });
    await refetch();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession.mutateAsync(id);
      router.push("/dashboard/sessions");
    }
  };

  const handleStartVideoCall = async () => {
    try {
      const response = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });

      if (!response.ok) throw new Error("Failed to create room");

      const { roomUrl } = await response.json();
      setRoomUrl(roomUrl);
      await handleStatusChange("in_progress");
      setShowVideoCall(true);
    } catch (error) {
      console.error("Failed to start video call:", error);
      toast.error("Failed to start video call");
    }
  };

  const handleCallEnd = async () => {
    setShowVideoCall(false);
    await handleStatusChange("completed");
    await refetch();
  };

  const copyClientLink = () => {
    const clientLink = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(clientLink);
    setCopied(true);
    toast.success("Link copied! Send this to your client.");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFallback = (content: React.ReactNode) => (
    <div className="space-y-8">
      <div
        className="rounded-3xl border bg-white/90 p-4 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <Button
          variant="ghost"
          asChild
          className="group w-full justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
        >
          <Link href="/dashboard/sessions">
            <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Sessions
          </Link>
        </Button>
      </div>
      {content}
    </div>
  );

  if (error) {
    return renderFallback(
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-rose-200 bg-rose-50/70 p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-rose-500">
          Error loading session
        </p>
        <p className="text-xs text-rose-400">{error.message}</p>
      </div>
    );
  }

  if (isLoading || !session) {
    return renderFallback(
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const scheduledDate = new Date(session.scheduled_at);
  const statusAccent: Record<SessionStatus, string> = {
    scheduled: "text-blue-600",
    in_progress: "text-emerald-600",
    completed: "text-slate-600",
    cancelled: "text-rose-600",
  };

  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl border bg-white/90 p-4 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="group rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
          >
            <Link href="/dashboard/sessions">
              <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
              Back to Sessions
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-[var(--theme-primary-hex)] hover:bg-[var(--theme-highlight)]"
              style={{ borderColor: "rgba(120, 57, 238, 0.24)" }}
              onClick={() => router.push(`/dashboard/sessions/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={deleteSession.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "rgba(120, 57, 238, 0.18)",
          background: themeConfig.gradients.panel,
        }}
      >
        <div
          className="absolute -top-24 right-0 h-48 w-48 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-24 left-0 h-56 w-56 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <CalendarClock className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
              Session
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Session with {session.client.full_name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Keep every milestone connected to your client&apos;s journey.
            </p>
          </div>
          <Badge
            className={`rounded-full border bg-white/70 px-4 py-1.5 text-xs font-semibold ${
              statusAccent[session.status as SessionStatus]
            }`}
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            {statusLabels[session.status as SessionStatus]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card
            className="rounded-3xl border shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Session Information
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Key details to prepare an intentional conversation.
                </p>
              </div>
              <NotebookPen className="h-5 w-5 text-[var(--theme-primary-hex)]/80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex items-center gap-3 rounded-2xl border bg-white/70 p-4"
                style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
              >
                <User className="h-5 w-5 text-[var(--theme-primary-hex)]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.client.full_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div
                  className="flex flex-1 min-w-[220px] items-center gap-3 rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <Calendar className="h-5 w-5 text-[var(--theme-primary-hex)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Scheduled Date
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(scheduledDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div
                  className="flex flex-1 min-w-[220px] items-center gap-3 rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <Clock className="h-5 w-5 text-[var(--theme-primary-hex)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(scheduledDate, "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              {session.duration_minutes && (
                <div
                  className="flex items-center gap-3 rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <Clock className="h-5 w-5 text-[var(--theme-primary-hex)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {session.duration_minutes} minutes
                    </p>
                  </div>
                </div>
              )}

              {session.call_type && (
                <div
                  className="flex items-center gap-3 rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <Video className="h-5 w-5 text-[var(--theme-primary-hex)]" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Call Type
                    </p>
                    <p className="text-sm font-semibold capitalize text-slate-900">
                      {session.call_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              )}

              {session.meeting_url && (
                <div
                  className="rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Meeting URL
                  </p>
                  <a
                    href={session.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-primary-hex)] hover:underline"
                  >
                    {session.meeting_url}
                  </a>
                </div>
              )}

              {session.notes && (
                <div
                  className="rounded-2xl border bg-white/70 p-4"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                    {session.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Join Link */}
          {session.status === "in_progress" && showVideoCall && (
            <Card
              className="rounded-3xl border shadow-sm bg-gradient-to-br from-purple-50 to-pink-50"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  Client Join Link
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Share this link with your client to join the session
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl border border-purple-200 bg-white px-4 py-3">
                    <code className="text-sm text-slate-700 break-all">
                      {`${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                      }/join/${id}`}
                    </code>
                  </div>
                  <Button
                    onClick={copyClientLink}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Call UI */}
          {session.status === "in_progress" && showVideoCall && roomUrl && (
            <Card
              className="rounded-3xl border shadow-sm"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Video Call
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Your session is being recorded automatically.
                </p>
              </CardHeader>
              <CardContent>
                <VideoCall
                  roomUrl={roomUrl}
                  sessionId={id}
                  onCallEnd={handleCallEnd}
                />
              </CardContent>
            </Card>
          )}

          {/* Recording Section */}
          {session.recordings && session.recordings.length > 0 && (
            <>
              {audioUrl ? (
                <AudioPlayer
                  fileUrl={audioUrl}
                  fileName={session.recordings[0].file_path}
                />
              ) : (
                <Card
                  className="rounded-3xl border shadow-sm"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm text-slate-600">Loading audio...</p>
                  </CardContent>
                </Card>
              )}

              {session.recordings[0].transcript && (
                <TranscriptViewer
                  transcript={session.recordings[0].transcript}
                  recordingId={session.recordings[0].id}
                  onUpdate={() => refetch()}
                />
              )}

              {/* Show summary section if: summary exists, or is processing/failed */}
              {(session.recordings[0].summary ||
                session.recordings[0].summary_status === "processing" ||
                session.recordings[0].summary_status === "failed") && (
                <SessionSummary
                  summary={session.recordings[0].summary || ""}
                  recordingId={session.recordings[0].id}
                  summaryStatus={
                    session.recordings[0].summary_status || "pending"
                  }
                  onRegenerate={() => refetch()}
                />
              )}

              {session.recordings[0].transcript_status === "processing" && (
                <Card
                  className="rounded-3xl border shadow-sm"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm text-slate-600">
                      Transcribing audio...
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Empty State - No Recording Yet */}
          {(!session.recordings || session.recordings.length === 0) &&
            session.status === "completed" && (
              <Card
                className="rounded-3xl border shadow-sm"
                style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Recording
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Processing your session recording...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-dashed border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-8 text-center">
                    <Video className="mx-auto mb-3 h-12 w-12 text-[var(--theme-primary-hex)]" />
                    <p className="text-sm font-medium text-slate-600">
                      Recording is being processed
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      This may take a few minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        <Card
          className="rounded-3xl border shadow-sm"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Quick Actions
            </CardTitle>
            <p className="text-sm text-slate-500">
              Stay responsive to session status changes.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {session.status === "scheduled" && (
              <Button
                className="w-full rounded-xl text-sm font-semibold text-white shadow-lg transition"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  boxShadow: themeConfig.colors.shadowPrimary,
                }}
                onClick={handleStartVideoCall}
                disabled={updateStatus.isPending}
              >
                <Video className="mr-2 h-4 w-4" />
                Start Video Call
              </Button>
            )}
            {session.status === "in_progress" && (
              <Button
                className="w-full rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
                onClick={() => handleStatusChange("completed")}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Session
              </Button>
            )}
            {(session.status === "scheduled" ||
              session.status === "in_progress") && (
              <Button
                className="w-full rounded-xl border text-sm font-semibold text-rose-500 hover:bg-rose-50"
                variant="outline"
                style={{ borderColor: "rgba(244, 63, 94, 0.38)" }}
                onClick={() => handleStatusChange("cancelled")}
                disabled={updateStatus.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Session
              </Button>
            )}
            <Button
              className="w-full rounded-xl border text-sm font-semibold text-[var(--theme-primary-hex)] hover:bg-[var(--theme-highlight)]"
              variant="outline"
              style={{ borderColor: "rgba(120, 57, 238, 0.24)" }}
              onClick={() =>
                router.push(`/dashboard/clients/${session.client.id}`)
              }
            >
              <User className="mr-2 h-4 w-4" />
              View Client Profile
            </Button>
            <div className="rounded-xl border border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-4 text-xs font-medium text-[var(--theme-primary-hex)]">
              Every update keeps your client journey aligned.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
