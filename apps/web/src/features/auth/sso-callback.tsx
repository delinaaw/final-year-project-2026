"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export function SsoCallback() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      <p className="text-body-m text-content-secondary">Signing you in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/forms"
        signUpFallbackRedirectUrl="/forms"
      />
    </div>
  );
}
