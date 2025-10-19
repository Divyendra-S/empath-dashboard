"use client";

import Link from "next/link";
import {
  Plus,
  Users,
  Calendar as CalendarIcon,
  TrendingUp,
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
      tone: "from-blue-500 to-indigo-500",
      helperTone: "text-emerald-600",
    },
    {
      label: "Today",
      value: 0,
      helper: "Sessions today",
      icon: CalendarIcon,
      tone: "from-purple-500 to-purple-600",
      helperTone: "text-slate-500",
    },
    {
      label: "This Week",
      value: stats?.upcomingSessions || 0,
      helper: "Upcoming",
      icon: Clock,
      tone: "from-pink-500 to-rose-500",
      helperTone: "text-slate-500",
    },
    {
      label: "Completed",
      value: stats?.thisWeekSessions || 0,
      helper: "This week",
      icon: CheckCircle2,
      tone: "from-emerald-500 to-teal-500",
      helperTone: "text-slate-500",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-purple-100/60 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 p-6 shadow-sm">
        <div className="absolute -top-16 right-0 h-36 w-36 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-slate-900">
            Good {timeOfDay} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">{dateString}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card, index) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {card.label}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/40 text-purple-600">
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
            className="hover:bg-slate-100 text-slate-700"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-200 bg-blue-50/60 p-10 text-center">
              <Clock className="h-10 w-10 text-blue-500" />
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
            className="hover:bg-slate-100 text-slate-700"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-200 bg-purple-50/60 p-10 text-center">
              <CalendarIcon className="h-10 w-10 text-purple-500" />
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
                className="mt-5 bg-white/70 font-medium text-purple-600 hover:bg-purple-100"
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
