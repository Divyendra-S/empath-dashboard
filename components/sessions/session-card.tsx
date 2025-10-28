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
  scheduled: "bg-[var(--theme-highlight)] text-[var(--theme-primary-hex)] border-[rgba(120,57,238,0.24)]",
  in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
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
      <div
        className="h-full cursor-pointer rounded-2xl border bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md"
        style={{ borderColor: "rgba(120, 57, 238, 0.14)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[var(--theme-highlight)] text-[var(--theme-primary-hex)] flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {session.client?.full_name || "Unknown Client"}
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
