"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/clients">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Add New Client</h1>
        <p className="text-gray-600">Create a new client profile</p>
      </div>

      <div className="max-w-2xl">
        <ClientForm mode="create" />
      </div>
    </div>
  );
}
