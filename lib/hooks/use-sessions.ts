"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
  type SessionInsert,
} from "@/lib/actions/sessions";
import { toast } from "sonner";
import type { SessionStatus } from "@/lib/types";

export function useSessions(filters?: {
  status?: SessionStatus;
  clientId?: string;
}) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => getSessions(filters),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => getSession(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SessionInsert) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionInsert> }) =>
      updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SessionStatus }) =>
      updateSessionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
