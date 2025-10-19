"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarHeart, Filter, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSessions } from "@/lib/hooks/use-sessions";
import { SessionCalendar } from "@/components/sessions/session-calendar";
import { SessionForm } from "@/components/sessions/session-form";
import type { SessionStatus } from "@/lib/types";
import type { View } from "react-big-calendar";
import { themeConfig } from "@/lib/theme";

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const newParam = searchParams.get("new");
  const scheduledAtParam = searchParams.get("scheduled_at");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>(
    undefined
  );
  const [calendarView, setCalendarView] = useState<View>(
    (viewParam as View) || "month"
  );
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Open drawer when 'new' param is present
  useEffect(() => {
    if (newParam === "true") {
      setIsDrawerOpen(true);
    }
  }, [newParam]);

  const {
    data: sessions,
    isLoading,
    error,
  } = useSessions({ status: statusFilter });

  const handleFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? undefined : (value as SessionStatus));
  };

  const handleViewChange = (view: View) => {
    setCalendarView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("new", "true");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    params.delete("scheduled_at");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div
          className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
          style={{
            borderColor: "rgba(120, 57, 238, 0.18)",
            background: themeConfig.gradients.panel,
          }}
        >
          <div
            className="absolute -top-24 right-10 h-44 w-44 rounded-full blur-3xl"
            style={{ background: themeConfig.colors.highlightStrong }}
          />
          <div
            className="absolute -bottom-28 left-0 h-56 w-56 rounded-full blur-3xl"
            style={{ background: themeConfig.colors.highlight }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
                style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
              >
                <CalendarHeart className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
                Schedule
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-slate-900">
                Master your calendar
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Stay in rhythm with every client session and milestone.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Button
                className="rounded-2xl text-sm font-semibold text-white shadow-lg transition"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  boxShadow: themeConfig.colors.shadowPrimary,
                }}
                onClick={handleOpenDrawer}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </Button>
              <div
                className="rounded-xl border bg-white/70 px-4 py-2 text-xs font-medium text-[var(--theme-primary-hex)] shadow-sm"
                style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
              >
                <Sparkles className="mr-1 inline h-4 w-4 text-[var(--theme-primary-hex)]" />{" "}
                Smart scheduling keeps you on track
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
              <Filter className="h-4 w-4 text-[var(--theme-primary-hex)]" />
              Filter by status
            </div>
            <Tabs defaultValue="all" onValueChange={handleFilterChange}>
              <TabsList
                className="rounded-2xl p-1"
                style={{
                  backgroundColor: themeConfig.colors.highlight,
                }}
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

        {error ? (
          <div
            className="rounded-3xl border bg-white/90 p-6 shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 py-16 text-center">
              <p className="text-sm font-semibold text-rose-500">
                Error loading sessions
              </p>
              <p className="mt-2 text-xs text-rose-400">{error.message}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div
            className="rounded-3xl border bg-white/90 p-6 shadow-sm"
            style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
          >
            <Skeleton className="h-[620px] w-full rounded-2xl" />
          </div>
        ) : sessions ? (
          <SessionCalendar
            sessions={sessions}
            view={calendarView}
            onViewChange={handleViewChange}
            date={calendarDate}
            onNavigate={setCalendarDate}
          />
        ) : null}
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          className="w-full border-l bg-white/95 p-0 shadow-2xl sm:max-w-2xl"
          style={{ borderColor: "rgba(120, 57, 238, 0.24)" }}
          onEscapeKeyDown={handleCloseDrawer}
          onInteractOutside={handleCloseDrawer}
        >
          <div className="flex h-full flex-col">
            <div
              className="relative overflow-hidden border-b px-6 py-8"
              style={{
                borderColor: "rgba(120, 57, 238, 0.18)",
                background: themeConfig.gradients.panel,
              }}
            >
              <div
                className="absolute -top-16 right-6 h-32 w-32 rounded-full blur-3xl"
                style={{ background: themeConfig.colors.highlightStrong }}
              />
              <div
                className="absolute -bottom-20 left-0 h-36 w-36 rounded-full blur-3xl"
                style={{ background: themeConfig.colors.highlight }}
              />
              <div className="relative space-y-4">
                <div
                  className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--theme-primary-hex)]/80"
                  style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
                >
                  <Plus className="h-3.5 w-3.5 text-[var(--theme-primary-hex)]" />
                  New Session
                </div>
                <SheetHeader className="space-y-2 p-0">
                  <SheetTitle className="text-2xl font-semibold text-slate-900">
                    Create a new session
                  </SheetTitle>
                  <SheetDescription className="text-sm text-slate-600">
                    Organize client time with clarity and care.
                  </SheetDescription>
                </SheetHeader>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6 py-6">
              <SessionForm
                defaultScheduledAt={scheduledAtParam || undefined}
                onSuccess={handleCloseDrawer}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
