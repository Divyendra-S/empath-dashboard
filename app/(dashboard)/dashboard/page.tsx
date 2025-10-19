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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div
        className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 rounded-2xl p-5"
        style={{ borderColor: "rgb(240 237 255)", borderWidth: "1px" }}
      >
        <h1 className="text-xl font-semibold text-gray-900">
          Good {timeOfDay} 👋
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">{dateString}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="hover:shadow-md transition-all duration-200"
          style={{ borderColor: "rgb(240 237 255)" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-2.5 px-4">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Total Clients
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-2.5 px-4">
            {statsLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <>
                <div className="text-xl font-bold text-gray-900">
                  {stats?.totalClients || 0}
                </div>
                <p className="text-xs text-green-600 mt-0.5 flex items-center font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active clients
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-all duration-200"
          style={{ borderColor: "rgb(240 237 255)" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-2.5 px-4">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Today
            </CardTitle>
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background:
                  "linear-gradient(to bottom right, #7839EE, #9d5eff)",
              }}
            >
              <CalendarIcon className="h-3.5 w-3.5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-2.5 px-4">
            {statsLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <>
                <div className="text-xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Sessions today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-all duration-200"
          style={{ borderColor: "rgb(240 237 255)" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-2.5 px-4">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              This Week
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-sm">
              <Clock className="h-3.5 w-3.5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-2.5 px-4">
            {statsLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <>
                <div className="text-xl font-bold text-gray-900">
                  {stats?.upcomingSessions || 0}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Upcoming
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-all duration-200"
          style={{ borderColor: "rgb(240 237 255)" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-2.5 px-4">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Completed
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pb-2.5 px-4">
            {statsLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <>
                <div className="text-xl font-bold text-gray-900">
                  {stats?.thisWeekSessions || 0}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  This week
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card style={{ borderColor: "rgb(240 237 255)" }}>
        <CardHeader
          className="pb-3"
          style={{ borderBottom: "1px solid rgb(246 244 255)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your latest sessions</CardDescription>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:bg-purple-50"
              style={{ color: "#7839EE" }}
            >
              <Link href="/dashboard/sessions">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {sessionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : recentSessions && recentSessions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No recent sessions
              </h3>
              <p className="text-sm text-gray-500">
                You haven&apos;t completed any sessions yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card style={{ borderColor: "rgb(240 237 255)" }}>
        <CardHeader
          className="pb-3"
          style={{ borderBottom: "1px solid rgb(246 244 255)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hover:bg-purple-50"
              style={{ color: "#7839EE" }}
            >
              <Link href="/dashboard/calendar">
                View Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Empty state - will be populated with real data later */}
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background:
                  "linear-gradient(to bottom right, rgb(246 244 255), rgb(240 237 255))",
              }}
            >
              <CalendarIcon className="h-7 w-7" style={{ color: "#7839EE" }} />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              No upcoming sessions
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Schedule your next session to get started
            </p>
            <Button
              asChild
              variant="ghost"
              className="hover:bg-purple-50 font-medium"
              style={{ color: "#7839EE" }}
            >
              <Link href="/dashboard/calendar">
                <Plus className="mr-2 h-4 w-4" />
                Schedule a Session
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
