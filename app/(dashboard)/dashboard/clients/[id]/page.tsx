"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, NotebookPen, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/lib/hooks/use-clients";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { ClientStats } from "@/components/clients/client-stats";
import { themeConfig } from "@/lib/theme";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading, error } = useClient(id);

  const renderFallback = (content: React.ReactNode) => (
    <div className="space-y-8">
      <div
        className="rounded-3xl border bg-white/90 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <Button
          variant="ghost"
          asChild
          className="group w-full justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:text-[var(--theme-primary-hex)]"
        >
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Client Directory
          </Link>
        </Button>
      </div>
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
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
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
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Client Directory
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
          className="absolute -top-24 right-4 h-48 w-48 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-20 left-0 h-52 w-52 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <UsersRound className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
              Profile
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              {client.full_name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Deepen understanding with client insights and history.
            </p>
          </div>
          <div
            className="rounded-2xl border bg-white/80 px-4 py-3 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <Sparkles className="mr-1 inline h-4 w-4 text-[var(--theme-primary-hex)]" /> Personalize care with every note
          </div>
        </div>
      </div>

      <ClientProfileHeader client={client} />

      <ClientStats clientId={id} />

      {client.notes && (
        <Card
          className="rounded-3xl border shadow-sm"
          style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Narrative Notes
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Capture reflections to guide future sessions.
              </CardDescription>
            </div>
            <NotebookPen className="h-5 w-5 text-[var(--theme-primary-hex)]/80" />
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card
        className="rounded-3xl border shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Session History
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Track completed milestones and upcoming touchpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-8 text-center">
            <p className="text-sm font-semibold text-[var(--theme-primary-hex)]">
              No sessions yet
            </p>
            <p className="text-xs text-slate-500">
              Schedule your first session to see it appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
