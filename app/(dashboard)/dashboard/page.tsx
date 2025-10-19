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
} from "@/lib/hooks/use-dashboard";
import { SessionCard } from "@/components/sessions/session-card";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentSessions, isLoading: sessionsLoading } =
    useRecentSessions();

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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 rounded-xl p-6 border border-purple-100/50">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good {timeOfDay} 👋
        </h1>
        <p className="text-sm text-gray-600 mt-1">{dateString}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Clients */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/60 hover:shadow-lg hover:border-gray-300/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Clients
            </span>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalClients || 0}
              </div>
              <p className="text-xs text-green-600 flex items-center font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                Active clients
              </p>
            </>
          )}
        </div>

        {/* Today */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/60 hover:shadow-lg hover:border-gray-300/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today
            </span>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
              <CalendarIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
              <p className="text-xs text-gray-500 font-medium">
                Sessions today
              </p>
            </>
          )}
        </div>

        {/* This Week */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/60 hover:shadow-lg hover:border-gray-300/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              This Week
            </span>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.upcomingSessions || 0}
              </div>
              <p className="text-xs text-gray-500 font-medium">Upcoming</p>
            </>
          )}
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl p-5 border border-gray-200/60 hover:shadow-lg hover:border-gray-300/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
          {statsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.thisWeekSessions || 0}
              </div>
              <p className="text-xs text-gray-500 font-medium">This week</p>
            </>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest sessions</p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Link href="/dashboard/sessions">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {sessionsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200/60">
            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No recent sessions
            </h3>
            <p className="text-sm text-gray-500">
              You haven&apos;t completed any sessions yet
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Sessions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your scheduled sessions
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hover:bg-gray-100 text-gray-700 font-medium"
          >
            <Link href="/dashboard/calendar">
              View Calendar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty state - will be populated with real data later */}
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200/60">
          <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No upcoming sessions
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Schedule your next session to get started
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="font-medium border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
          >
            <Link href="/dashboard/calendar">
              <Plus className="mr-2 h-4 w-4" />
              Schedule a Session
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
