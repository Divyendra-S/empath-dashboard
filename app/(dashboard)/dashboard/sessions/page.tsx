"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Clock4, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessions } from "@/lib/hooks/use-sessions";
import { SessionCard } from "@/components/sessions/session-card";
import type { SessionStatus } from "@/lib/types";
import { themeConfig } from "@/lib/theme";

export default function SessionsPage() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>(
    undefined
  );

  const {
    data: sessions,
    isLoading,
    error,
  } = useSessions({ status: statusFilter });

  const handleFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : (value as SessionStatus));
  };

  return (
    <div className="space-y-8">
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
          className="absolute -bottom-24 left-2 h-52 w-52 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <CalendarClock className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
              Sessions
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Guide every conversation with purpose
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Track each session&apos;s progress and next steps at a glance.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button
              asChild
              className="rounded-2xl text-sm font-semibold text-white shadow-lg transition"
              style={{
                backgroundColor: themeConfig.colors.primary,
                boxShadow: themeConfig.colors.shadowPrimary,
              }}
            >
              <Link href="/dashboard/calendar?new=true">
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </Link>
            </Button>
            <div
              className="rounded-xl border bg-white/70 px-4 py-2 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <Sparkles className="mr-1 inline h-4 w-4 text-[var(--theme-primary-hex)]" /> Stay aligned with your clients
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Clock4 className="h-4 w-4 text-[var(--theme-primary-hex)]" /> Filter by status
          </div>
          <Tabs defaultValue="all" onValueChange={handleFilterChange}>
            <TabsList
              className="rounded-2xl p-1"
              style={{ backgroundColor: themeConfig.colors.highlight }}
            >
              <TabsTrigger value="all" className="rounded-xl">
                All
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-xl">
                Scheduled
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="rounded-xl">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-xl">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div
        className="rounded-3xl border bg-white/90 p-6 shadow-sm"
        style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-12 text-center">
            <p className="text-sm font-semibold text-rose-500">
              Error loading sessions
            </p>
            <p className="text-xs text-rose-400">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : sessions && sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[rgba(120,57,238,0.32)] bg-[var(--theme-highlight)] p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No sessions yet
            </h3>
            <p className="text-sm text-slate-500">
              Schedule your first conversation to see it appear here.
            </p>
            <Button
              asChild
              className="rounded-xl text-sm font-semibold text-white shadow-lg transition"
              style={{
                backgroundColor: themeConfig.colors.primary,
                boxShadow: themeConfig.colors.shadowPrimary,
              }}
            >
              <Link href="/dashboard/calendar?new=true">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Session
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions?.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
