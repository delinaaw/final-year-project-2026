"use client";

import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { CLERK_ENABLED } from "@/features/auth/config";

const PROVIDERS = [
  {
    id: "oauth_google" as const,
    name: "Google",
    label: "Continue with Google",
    icon: "/brand/google.svg",
    width: 22,
    height: 22,
  },
  {
    id: "oauth_apple" as const,
    name: "Apple",
    label: "Continue with Apple",
    icon: "/brand/apple.svg",
    width: 20,
    height: 22,
  },
];

type Provider = (typeof PROVIDERS)[number]["id"];

export function SocialButtons() {
  const { signIn, isLoaded } = useSignIn();
  const [redirecting, setRedirecting] = useState<Provider | null>(null);

  const start = async (provider: (typeof PROVIDERS)[number]) => {
    if (!CLERK_ENABLED || !isLoaded || !signIn) {
      toast.info("Social sign-in is not configured yet");
      return;
    }

    setRedirecting(provider.id);

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider.id,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/sso-callback",
      });
    } catch {
      setRedirecting(null);
      toast.error(`Could not open ${provider.name} sign-in`);
    }
  };

  const busy = redirecting !== null;

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => {
        const active = redirecting === provider.id;

        return (
          <button
            key={provider.id}
            type="button"
            onClick={() => start(provider)}
            disabled={busy || !isLoaded}
            aria-busy={active}
            className="focus-ring flex h-[56px] w-full items-center justify-center gap-3 rounded-lg border border-line bg-surface-card text-body-m font-semibold text-content-primary transition-colors hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-surface-card"
          >
            {active ? (
              <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
            ) : (
              <Image
                src={provider.icon}
                alt=""
                width={provider.width}
                height={provider.height}
                className="shrink-0"
              />
            )}
            {active ? `Opening ${provider.name}…` : provider.label}
          </button>
        );
      })}
    </div>
  );
}
