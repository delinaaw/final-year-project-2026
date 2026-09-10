import { env } from "@/lib/env";

export const CLERK_ENABLED = Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  {
    id: "numberSymbol",
    label: "One number and one symbol",
    test: (v: string) => /\d/.test(v) && /[^A-Za-z0-9]/.test(v),
  },
  { id: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
] as const;

export const RESEND_COOLDOWN_SECONDS = 45;
