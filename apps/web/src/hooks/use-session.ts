"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authApi, type AuthResponse } from "@/features/auth/api";
import { queryKeys } from "@/lib/query-keys";
import { clearSession, storeSession } from "@/lib/session";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAuthSuccess() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (response: AuthResponse, destination: string) => {
    storeSession(response.tokens.access_token, response.tokens.refresh_token);
    queryClient.setQueryData(queryKeys.session, response.user);
    router.push(destination);
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logOut,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.push("/login");
    },
  });
}
