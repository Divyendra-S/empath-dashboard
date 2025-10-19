"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRecentSessions,
  getUpcomingSessions,
} from "@/lib/actions/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useRecentSessions() {
  return useQuery({
    queryKey: ["dashboard", "recent-sessions"],
    queryFn: getRecentSessions,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUpcomingSessions() {
  return useQuery({
    queryKey: ["dashboard", "upcoming-sessions"],
    queryFn: getUpcomingSessions,
    staleTime: 1000 * 60, // 1 minute
  });
}
