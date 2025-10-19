"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Video,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  useSession,
  useUpdateSessionStatus,
  useDeleteSession,
} from "@/lib/hooks/use-sessions";
import type { SessionStatus } from "@/lib/types";

const statusColors: Record<SessionStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

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
  const { data: session, isLoading, error } = useSession(id);
  const updateStatus = useUpdateSessionStatus();
  const deleteSession = useDeleteSession();

  const handleStatusChange = async (status: SessionStatus) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession.mutateAsync(id);
      router.push("/dashboard/sessions");
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const scheduledDate = new Date(session.scheduled_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Session Details</h1>
          <Badge className={`${statusColors[session.status as SessionStatus]} mt-2`}>
            {statusLabels[session.status as SessionStatus]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/sessions/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteSession.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Session Info */}
        <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{session.client.full_name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="font-medium">
                  {format(scheduledDate, "MMMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-500">
                  {format(scheduledDate, "h:mm a")}
                </p>
              </div>
            </div>

            {session.duration_minutes && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {session.duration_minutes} minutes
                    </p>
                  </div>
                </div>
              </>
            )}

            {session.call_type && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Call Type</p>
                    <p className="font-medium capitalize">
                      {session.call_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </>
            )}

            {session.meeting_url && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Meeting URL</p>
                  <a
                    href={session.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {session.meeting_url}
                  </a>
                </div>
              </>
            )}

            {session.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="whitespace-pre-wrap">{session.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recording Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recording</CardTitle>
          </CardHeader>
          <CardContent>
            {session.status === "completed" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Recording will be available here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Phase 4: Video Calling & Recording
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Recording available after session completion</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcription Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            {session.status === "completed" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Transcription will be displayed here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Phase 5: Automatic Transcription with Groq
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Transcription available after session completion</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Actions Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session.status === "scheduled" && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange("in_progress")}
                disabled={updateStatus.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            )}
            {session.status === "in_progress" && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange("completed")}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Session
              </Button>
            )}
            {(session.status === "scheduled" ||
              session.status === "in_progress") && (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleStatusChange("cancelled")}
                disabled={updateStatus.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Session
              </Button>
            )}
            <Button
              className="w-full"
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/clients/${session.client.id}`)
              }
            >
              <User className="h-4 w-4 mr-2" />
              View Client Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
