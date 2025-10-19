"use client";

import Link from "next/link";
import { Edit, Archive, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useArchiveClient } from "@/lib/hooks/use-clients";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { themeConfig } from "@/lib/theme";

interface ClientProfileHeaderProps {
  client: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    created_at: string;
  };
}

export function ClientProfileHeader({ client }: ClientProfileHeaderProps) {
  const router = useRouter();
  const { mutate: archiveClient, isPending } = useArchiveClient();

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this client?")) {
      archiveClient(client.id, {
        onSuccess: () => {
          router.push("/dashboard/clients");
        },
      });
    }
  };

  const initials = client.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-3xl border bg-white/90 p-6 shadow-sm"
      style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback
              className="text-white text-xl"
              style={{ background: themeConfig.gradients.icon }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{client.full_name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild className="rounded-xl">
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={isPending}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {client.date_of_birth && (
          <div>
            <span className="text-gray-600">Date of Birth:</span>{" "}
            <span className="font-medium">
              {format(new Date(client.date_of_birth), "MMMM d, yyyy")}
            </span>
          </div>
        )}
        <div>
          <span className="text-gray-600">Client Since:</span>{" "}
          <span className="font-medium">
            {format(new Date(client.created_at), "MMMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
