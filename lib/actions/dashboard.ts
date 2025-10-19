"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export interface DashboardStats {
  totalClients: number;
  upcomingSessions: number;
  thisWeekSessions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get total active clients
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "active");

  // Get upcoming sessions (next 7 days)
  const now = new Date();
  const next7Days = addDays(now, 7);

  const { count: upcomingSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", next7Days.toISOString());

  // Get completed sessions this week
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const { count: thisWeekSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "completed")
    .gte("scheduled_at", weekStart.toISOString())
    .lte("scheduled_at", weekEnd.toISOString());

  return {
    totalClients: totalClients || 0,
    upcomingSessions: upcomingSessions || 0,
    thisWeekSessions: thisWeekSessions || 0,
  };
}

export async function getRecentSessions() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      client:clients(*)
    `
    )
    .eq("therapist_id", user.id)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}

export async function getUpcomingSessions() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const now = new Date();

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      client:clients(*)
    `
    )
    .eq("therapist_id", user.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  if (error) throw error;
  return data;
}
