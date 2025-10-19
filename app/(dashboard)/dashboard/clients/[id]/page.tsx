"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/lib/hooks/use-clients";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { ClientStats } from "@/components/clients/client-stats";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading, error } = useClient(id);

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/clients">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/clients">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <div className="text-center py-12">
          <p>Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/clients">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </Button>

      <ClientProfileHeader client={client} />

      <ClientStats clientId={id} />

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>Past and upcoming sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            No sessions yet. Sessions will appear here once scheduled in Phase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
