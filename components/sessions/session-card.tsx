"use client";

import Link from "next/link";
import { Calendar, Clock, User, Video } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        style={{ borderColor: "rgb(240 237 255)" }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {session.client.full_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(scheduledDate, "MMM d, yyyy 'at' h:mm a")}
              </CardDescription>
            </div>
            <Badge className={statusColors[session.status]}>
              {statusLabels[session.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5 text-sm text-gray-600">
            {session.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{session.duration_minutes} minutes</span>
              </div>
            )}
            {session.call_type && (
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5" />
                <span className="capitalize">
                  {session.call_type.replace("_", " ")}
                </span>
              </div>
            )}
            {session.notes && (
              <p className="text-gray-500 line-clamp-2 mt-2">{session.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
