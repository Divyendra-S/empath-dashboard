"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/lib/hooks/use-clients";
import { ClientCard } from "@/components/clients/client-card";
import { ClientSearch } from "@/components/clients/client-search";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading, error } = useClients(search);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      {/* Search */}
      <ClientSearch value={search} onChange={setSearch} />

      {/* Content */}
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
      ) : clients && clients.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first client
          </p>
          <Button asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients?.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
