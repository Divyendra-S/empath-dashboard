"use client";

import { useSearchParams } from "next/navigation";
import { SessionForm } from "@/components/sessions/session-form";

export default function NewSessionPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Schedule New Session</h1>
        <p className="text-gray-600">
          Schedule a therapy session with a client
        </p>
      </div>

      <SessionForm defaultClientId={clientId} />
    </div>
  );
}
