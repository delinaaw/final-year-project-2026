"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

import { ClerkTokenBridge } from "@/components/auth/clerk-token-bridge";
import { CLERK_ENABLED } from "@/features/auth/config";
import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  const tree = (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );

  if (!CLERK_ENABLED) return tree;

  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignOutUrl="/login"
      appearance={{ variables: { colorPrimary: "#807dfe" } }}
    >
      <ClerkTokenBridge />
      {tree}
    </ClerkProvider>
  );
}
