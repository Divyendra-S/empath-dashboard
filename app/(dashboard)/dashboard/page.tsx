"use client";

import Link from "next/link";
import {
  Plus,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardStats,
  useRecentSessions,
  useUpcomingSessions,
} from "@/lib/hooks/use-dashboard";
import { SessionCard } from "@/components/sessions/session-card";
import { themeConfig } from "@/lib/theme";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentSessions, isLoading: sessionsLoading } =
    useRecentSessions();
  const { data: upcomingSessions, isLoading: upcomingLoading } =
    useUpcomingSessions();

  // Get current date info for welcome message
  const now = new Date();
  const timeOfDay =
    now.getHours() < 12
      ? "morning"
      : now.getHours() < 18
      ? "afternoon"
      : "evening";
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const metricCards = [
    {
      label: "Total Clients",
      value: stats?.totalClients || 0,
      helper: "Active clients",
      icon: Users,
      helperTone: "text-emerald-600",
    },
    {
      label: "Today",
      value: 0,
      helper: "Sessions today",
      icon: CalendarIcon,
      helperTone: "text-slate-500",
    },
    {
      label: "This Week",
      value: stats?.upcomingSessions || 0,
      helper: "Upcoming",
      icon: Clock,
      helperTone: "text-slate-500",
    },
    {
      label: "Completed",
      value: stats?.thisWeekSessions || 0,
      helper: "This week",
      icon: CheckCircle2,
      helperTone: "text-slate-500",
    },
  ];

  return (
    <div className="space-y-10">
      <section
        className="relative overflow-hidden rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: "rgba(120, 57, 238, 0.18)",
          background: themeConfig.gradients.panel,
        }}
      >
        <div
          className="absolute -top-16 right-0 h-36 w-36 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlightStrong }}
        />
        <div
          className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full blur-3xl"
          style={{ background: themeConfig.colors.highlight }}
        />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-slate-900">
            Good {timeOfDay} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">{dateString}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card, index) => (
              <div
                key={card.label}
                className="rounded-2xl border p-4 backdrop-blur-sm"
                style={{
                  borderColor: "rgba(120, 57, 238, 0.16)",
                  backgroundColor: "rgba(255,255,255,0.82)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </span>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: themeConfig.gradients.badge,
                      color: themeConfig.colors.primary,
                    }}
                  >
                    {index === 0 ? (
                      <Users className="h-4 w-4" />
                    ) : index === 1 ? (
                      <CalendarIcon className="h-4 w-4" />
                    ) : index === 2 ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-3xl font-semibold text-slate-900">
                        {card.value}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {card.helper}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Sessions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track the latest conversations at a glance
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-700"
            style={{ borderRadius: "0.75rem" }}
          >
            <Link href="/dashboard/sessions">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6">
          {sessionsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : recentSessions && recentSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border bg-white p-10 text-center"
              style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
            >
              <Clock className="h-10 w-10 text-[var(--theme-primary-hex)]" />
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No recent sessions yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Completed sessions will appear here for quick review.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Sessions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Stay ahead with a clear view of what&apos;s next
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-700"
            style={{ borderRadius: "0.75rem" }}
          >
            <Link href="/dashboard/calendar">
              View calendar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6">
          {upcomingLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(120,57,238,0.24)] bg-[var(--theme-highlight)] p-10 text-center">
              <CalendarIcon className="h-10 w-10 text-[var(--theme-primary-hex)]" />
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No upcoming sessions
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Schedule your next session to populate this view.
              </p>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-5 font-medium text-[var(--theme-primary-hex)]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  borderRadius: "0.75rem",
                  color: "var(--theme-primary-hex)",
                }}
              >
                <Link href="/dashboard/calendar">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to calendar
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
