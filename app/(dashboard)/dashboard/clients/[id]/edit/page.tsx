"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/lib/hooks/use-clients";
import { ClientForm } from "@/components/clients/client-form";
import { themeConfig } from "@/lib/theme";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading, error } = useClient(id);

  const renderFallback = (content: React.ReactNode) => (
    <div className="space-y-6">
      <Button
        variant="ghost"
        asChild
        className="group w-full justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
      >
        <Link href="/dashboard/clients">
          <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
          Back to Clients
        </Link>
      </Button>
      {content}
    </div>
  );

  if (error) {
    return renderFallback(
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-rose-200 bg-rose-50/70 p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-rose-500">
          Error loading client
        </p>
        <p className="text-xs text-rose-400">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return renderFallback(
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!client) {
    return renderFallback(
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-[var(--theme-primary-hex)]">
          Client not found
        </p>
        <p className="text-xs text-[var(--theme-primary-hex)]/80">
          Double-check the link or return to your client list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl border bg-white/90 p-4 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <Button
          variant="ghost"
          asChild
          className="group w-full justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
        >
          <Link href={`/dashboard/clients/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Client Profile
          </Link>
        </Button>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "rgba(120, 57, 238, 0.18)",
          background: themeConfig.gradients.panel,
        }}
      >
        <div
          className="absolute -top-24 right-0 h-44 w-44 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-24 left-0 h-52 w-52 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-col gap-3">
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            Update
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Update client profile
          </h1>
          <p className="text-sm text-slate-600">
            Keep information current to provide thoughtful, tailored care.
          </p>
          <div
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <Sparkles className="h-4 w-4 text-[var(--theme-primary-hex)]" /> Changes sync across the care journey
          </div>
        </div>
      </div>

      <div
        className="max-w-2xl rounded-3xl border bg-white/90 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <ClientForm mode="edit" client={client} />
      </div>
    </div>
  );
}
