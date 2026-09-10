"use client";

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authApi, type AuthResponse } from "@/features/auth/api";
import { CLERK_ENABLED } from "@/features/auth/config";
import { queryKeys } from "@/lib/query-keys";
import { clearSession, storeSession } from "@/lib/session";

export function useSession() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !CLERK_ENABLED || (isLoaded && isSignedIn === true),
  });

  if (!CLERK_ENABLED) return query;

  if (!isLoaded) {
    return { ...query, data: undefined, isPending: true, isError: false } as typeof query;
  }

  if (!isSignedIn) {
    return { ...query, data: undefined, isPending: false, isError: true } as typeof query;
  }

  const fallback = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        full_name: user.fullName ?? user.username ?? "There",
        avatar_url: user.imageUrl ?? null,
        email_verified_at: new Date().toISOString(),
      }
    : undefined;

  return { ...query, data: query.data ?? fallback } as typeof query;
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
  const clerk = useClerk();

  return useMutation({
    mutationFn: async () => {
      if (CLERK_ENABLED) {
        await clerk.signOut();
        return;
      }
      await authApi.logOut();
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.push("/login");
    },
  });
}
