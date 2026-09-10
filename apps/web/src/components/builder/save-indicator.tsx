"use client";

import { Check, CircleAlert, Loader2 } from "lucide-react";

import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";

const STATES = {
  idle: null,
  saving: {
    icon: Loader2,
    label: "Saving…",
    className: "bg-surface-subtle text-content-secondary",
    spin: true,
  },
  saved: {
    icon: Check,
    label: "All changes saved",
    className: "bg-feedback-success-subtle text-feedback-success",
    spin: false,
  },
  error: {
    icon: CircleAlert,
    label: "Could not save",
    className: "bg-feedback-error-subtle text-feedback-error",
    spin: false,
  },
} as const;

export function SaveIndicator() {
  const saveState = useBuilderStore((state) => state.saveState);
  const config = STATES[saveState];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "hidden items-center gap-2 rounded-full px-3 py-1.5 text-[12px] leading-4 sm:inline-flex",
        config.className,
      )}
    >
      <Icon className={cn("size-3.5", config.spin && "animate-spin")} />
      {config.label}
    </span>
  );
}
