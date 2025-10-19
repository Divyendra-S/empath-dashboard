"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/lib/hooks/use-clients";
import { ClientForm } from "@/components/clients/client-form";

export default function EditClientPage({
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
        <Skeleton className="h-96" />
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
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/dashboard/clients/${id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Client Profile
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Edit Client</h1>
        <p className="text-gray-600">Update client information</p>
      </div>

      <div className="max-w-2xl">
        <ClientForm mode="edit" client={client} />
      </div>
    </div>
  );
}
