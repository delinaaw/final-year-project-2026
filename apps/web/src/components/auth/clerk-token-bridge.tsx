"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import { useExternalTokens } from "@/lib/session";

export function ClerkTokenBridge() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    useExternalTokens(() => getToken());
    return () => useExternalTokens(null);
  }, [getToken, isLoaded]);

  return null;
}
