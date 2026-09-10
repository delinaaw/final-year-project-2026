"use client";

import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthHeading } from "@/components/auth/auth-heading";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { storeSession } from "@/lib/session";

export function SsoCallback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const exchanged = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || exchanged.current) return;
    exchanged.current = true;

    const run = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("no session token");

        const result = await authApi.exchangeClerkSession(token);
        storeSession(result.tokens.access_token, result.tokens.refresh_token);
        queryClient.setQueryData(queryKeys.session, result.user);

        await signOut();
        router.replace("/forms");
      } catch (cause) {
        setError(
          cause instanceof ApiError ? cause.message : "Could not finish signing you in",
        );
      }
    };

    void run();
  }, [isLoaded, isSignedIn, getToken, signOut, router, queryClient]);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <AuthHeading title="Sign-in did not finish" description="Something went wrong on the way back." />
        <AuthAlert message={error} />
        <Button onClick={() => router.replace("/login")}>Back to log in</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      <p className="text-body-m text-content-secondary">Signing you in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/sso-callback"
        signUpFallbackRedirectUrl="/sso-callback"
      />
    </div>
  );
}
