"use client";

import Link from "next/link";
import { Calendar, Clock, User, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SessionWithClient } from "@/lib/types";
import { format } from "date-fns";

interface SessionCardProps {
  session: SessionWithClient;
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function SessionCard({ session }: SessionCardProps) {
  const scheduledDate = new Date(session.scheduled_at);

  return (
    <Link href={`/dashboard/sessions/${session.id}`}>
      <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {session.client.full_name}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                {format(scheduledDate, "MMM d, h:mm a")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {session.duration_minutes && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{session.duration_minutes} minutes</span>
            </div>
          )}
          {session.call_type && (
            <div className="flex items-center gap-2 text-gray-600">
              <Video className="h-4 w-4" />
              <span className="capitalize">
                {session.call_type.replace("_", " ")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Badge className={`${statusColors[session.status]} text-xs border`}>
            {statusLabels[session.status]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
