"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessions } from "@/lib/hooks/use-sessions";
import { SessionCard } from "@/components/sessions/session-card";
import type { SessionStatus } from "@/lib/types";

export default function SessionsPage() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>(
    undefined
  );

  const {
    data: sessions,
    isLoading,
    error,
  } = useSessions({ status: statusFilter });

  const handleFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : (value as SessionStatus));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Sessions</h1>
          <p className="text-gray-600">View and manage your therapy sessions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calendar?new=true">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      {/* Status Filters */}
      <Tabs defaultValue="all" onValueChange={handleFilterChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sessions List */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : sessions && sessions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No sessions yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by scheduling your first session
          </p>
          <Button asChild>
            <Link href="/dashboard/calendar?new=true">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions?.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
