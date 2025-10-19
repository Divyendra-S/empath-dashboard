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
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
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
      <div className="bg-white rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-200/60 hover:border-gray-300/60 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              {session.client.full_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2 ml-10">
              <Calendar className="h-3.5 w-3.5" />
              {format(scheduledDate, "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge className={statusColors[session.status]}>
            {statusLabels[session.status]}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600 ml-10">
          {session.duration_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {session.duration_minutes} minutes
              </span>
            </div>
          )}
          {session.call_type && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="capitalize font-medium">
                {session.call_type.replace("_", " ")}
              </span>
            </div>
          )}
          {session.notes && (
            <p className="text-gray-500 line-clamp-2 mt-3 ml-0">
              {session.notes}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
