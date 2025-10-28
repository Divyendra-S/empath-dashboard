"use server";

import { createServerClientA as createSupabaseClient } from "@/lib/supabase/server-a";
import { startOfWeek, endOfWeek, addDays } from "date-fns";
import { getProjectBClients, getProjectBSessions } from "./project-b";

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

  // Get total active clients from Project A
  const { count: projectAClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "active");

  // Get Project B clients (all profiles)
  const projectBClients = await getProjectBClients();
  
  // Create Set of Project A IDs to avoid double-counting synced clients
  const { data: projectAClientsList } = await supabase
    .from("clients")
    .select("id")
    .eq("therapist_id", user.id)
    .eq("status", "active");
  
  const projectAIds = new Set((projectAClientsList || []).map(c => c.id));
  const uniqueProjectBCount = projectBClients.filter(c => !projectAIds.has(c.id)).length;
  
  const totalClients = (projectAClients || 0) + uniqueProjectBCount;

  // Get upcoming sessions from both projects
  const now = new Date();
  const next7Days = addDays(now, 7);

  // Project A upcoming sessions
  const { count: projectAUpcoming } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", next7Days.toISOString());

  // Project B sessions
  const projectBSessions = await getProjectBSessions();
  const projectBUpcoming = projectBSessions.filter(s => {
    const scheduledDate = new Date(s.scheduled_at);
    return s.status === "scheduled" && 
           scheduledDate >= now && 
           scheduledDate <= next7Days;
  }).length;

  const upcomingSessions = (projectAUpcoming || 0) + projectBUpcoming;

  // Get completed sessions this week from both projects
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  // Project A completed this week
  const { count: projectAThisWeek } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id)
    .eq("status", "completed")
    .gte("scheduled_at", weekStart.toISOString())
    .lte("scheduled_at", weekEnd.toISOString());

  // Project B completed this week
  const projectBThisWeek = projectBSessions.filter(s => {
    const scheduledDate = new Date(s.scheduled_at);
    return s.status === "completed" && 
           scheduledDate >= weekStart && 
           scheduledDate <= weekEnd;
  }).length;

  const thisWeekSessions = (projectAThisWeek || 0) + projectBThisWeek;

  return {
    totalClients,
    upcomingSessions,
    thisWeekSessions,
  };
}

export async function getRecentSessions() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get Project A recent sessions
  const { data: projectASessions, error } = await supabase
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
    .limit(10);

  if (error) throw error;

  // Add source marker
  const projectAWithSource = (projectASessions || []).map(s => ({
    ...s,
    source: "project_a" as const,
  }));

  // Get Project B completed sessions
  const projectBSessions = await getProjectBSessions();
  const projectBCompleted = projectBSessions.filter(s => s.status === "completed");

  // Merge and sort by scheduled_at
  const allSessions = [...projectAWithSource, ...projectBCompleted]
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5); // Take top 5

  return allSessions;
}

export async function getUpcomingSessions() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const now = new Date();

  // Get Project A upcoming sessions
  const { data: projectASessions, error } = await supabase
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
    .limit(10);

  if (error) throw error;

  // Add source marker
  const projectAWithSource = (projectASessions || []).map(s => ({
    ...s,
    source: "project_a" as const,
  }));

  // Get Project B scheduled sessions
  const projectBSessions = await getProjectBSessions();
  const projectBScheduled = projectBSessions.filter(s => {
    const scheduledDate = new Date(s.scheduled_at);
    return s.status === "scheduled" && scheduledDate >= now;
  });

  // Merge and sort by scheduled_at (ascending)
  const allSessions = [...projectAWithSource, ...projectBScheduled]
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5); // Take top 5

  return allSessions;
}
