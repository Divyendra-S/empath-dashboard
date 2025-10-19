"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/hooks/use-sessions";
import { SessionForm } from "@/components/sessions/session-form";

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isLoading, error } = useSession(id);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Edit Session</h1>
        <p className="text-gray-600">Update session details</p>
      </div>

      <SessionForm session={session} />
    </div>
  );
}
