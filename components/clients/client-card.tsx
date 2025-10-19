"use client";

import Link from "next/link";
import { MoreVertical, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useArchiveClient } from "@/lib/hooks/use-clients";
import { formatDistanceToNow } from "date-fns";

interface ClientCardProps {
  client: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    created_at: string;
  };
}

export function ClientCard({ client }: ClientCardProps) {
  const { mutate: archiveClient, isPending } = useArchiveClient();

  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this client?")) {
      archiveClient(client.id);
    }
  };

  return (
    <Card
      className="transition-shadow hover:shadow-lg"
      style={{ borderColor: "rgba(120, 57, 238, 0.14)" }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/dashboard/clients/${client.id}`}>
              <h3 className="text-lg font-semibold transition-colors hover:text-[var(--theme-primary-hex)]">
                {client.full_name}
              </h3>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/clients/${client.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/clients/${client.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleArchive}
                disabled={isPending}
                className="text-red-600"
              >
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="truncate">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Added {formatDistanceToNow(new Date(client.created_at))} ago
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
