"use client";

import Image from "next/image";
import { toast } from "sonner";

import { CLERK_ENABLED } from "@/features/auth/config";

type SignInLike = {
  authenticateWithRedirect: (params: {
    strategy: "oauth_google" | "oauth_apple";
    redirectUrl: string;
    redirectUrlComplete: string;
  }) => Promise<unknown>;
};

const PROVIDERS = [
  {
    id: "oauth_google" as const,
    label: "Continue with Google",
    icon: "/brand/google.svg",
    width: 22,
    height: 22,
  },
  {
    id: "oauth_apple" as const,
    label: "Continue with Apple",
    icon: "/brand/apple.svg",
    width: 20,
    height: 22,
  },
];

export function SocialButtons({
  signIn,
  isLoaded,
}: {
  signIn?: SignInLike | null;
  isLoaded?: boolean;
}) {

  const start = async (strategy: (typeof PROVIDERS)[number]["id"]) => {
    if (!CLERK_ENABLED || !isLoaded || !signIn) {
      toast.info("Social sign-in is not configured yet");
      return;
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/forms",
      });
    } catch {
      toast.error("Could not start that sign-in");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => start(provider.id)}
          aria-disabled={!CLERK_ENABLED}
          className="focus-ring flex h-[56px] w-full items-center justify-center gap-3 rounded-lg border border-line bg-surface-card text-body-m font-semibold text-content-primary transition-colors hover:bg-surface-subtle aria-disabled:opacity-55"
        >
          <Image
            src={provider.icon}
            alt=""
            width={provider.width}
            height={provider.height}
            className="shrink-0"
          />
          {provider.label}
        </button>
      ))}
    </div>
  );
}
