"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/actions/auth";
import { toast } from "sonner";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
