"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  archiveClient,
  unarchiveClient,
  getClientStats,
  type ClientInsert,
} from "@/lib/actions/clients";
import { toast } from "sonner";

export function useClients(search?: string) {
  return useQuery({
    queryKey: ["clients", search],
    queryFn: () => getClients(search),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id),
    enabled: !!id,
  });
}

export function useClientStats(id: string) {
  return useQuery({
    queryKey: ["clients", id, "stats"],
    queryFn: () => getClientStats(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientInsert> }) =>
      updateClient(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["clients", id] });

      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(["clients", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(["clients", id], (old: unknown) => ({
        ...(old as object),
        ...data,
      }));

      return { previousClient };
    },
    onError: (err: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousClient) {
        queryClient.setQueryData(["clients", id], context.previousClient);
      }
      toast.error(err.message);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", id] });
      toast.success("Client updated successfully");
    },
  });
}

export function useArchiveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client archived");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnarchiveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client restored");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
