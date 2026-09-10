"use client";

import Image from "next/image";
import { toast } from "sonner";

import { OAUTH_ENABLED } from "@/features/auth/config";

const PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: "/brand/google.svg", width: 22, height: 22 },
  { id: "apple", label: "Continue with Apple", icon: "/brand/apple.svg", width: 20, height: 22 },
] as const;

export function SocialButtons() {
  const handleClick = (provider: string) => {
    if (!OAUTH_ENABLED) {
      toast.info("Social sign-in is not configured yet");
      return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/${provider}/start`;
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleClick(provider.id)}
          aria-disabled={!OAUTH_ENABLED}
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
