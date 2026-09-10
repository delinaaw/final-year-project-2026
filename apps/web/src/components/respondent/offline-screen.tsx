"use client";

import { WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function OfflineScreen({
  pendingCount,
  onRetry,
  onContinue,
}: {
  pendingCount: number;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <header className="flex h-[72px] shrink-0 items-center border-b border-line bg-surface-card px-5 sm:px-8">
        <Logo tone="marine" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-7 px-5 py-10 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-surface-subtle">
          <WifiOff className="size-10 text-content-secondary" />
        </span>

        <div className="flex flex-col gap-3.5">
          <h1 className="text-[30px] font-bold leading-9 text-content-primary sm:text-[40px] sm:leading-[48px]">
            You&rsquo;re offline
          </h1>
          <p className="max-w-[560px] text-body-m leading-6 text-content-secondary sm:text-body-l">
            Your answers so far are saved on this device. Reconnect and this form will pick up
            exactly where you left off.
          </p>
        </div>

        <div className="flex w-full max-w-[400px] flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onRetry} className="sm:w-[190px]">
            Retry connection
          </Button>
          <Button size="lg" variant="secondary" onClick={onContinue} className="sm:w-[190px]">
            Continue offline
          </Button>
        </div>

        {pendingCount > 0 ? (
          <span className="rounded-full bg-surface-subtle px-3.5 py-2 text-[12px] leading-4 text-content-secondary">
            {pendingCount} {pendingCount === 1 ? "answer" : "answers"} saved locally
          </span>
        ) : null}
      </main>
    </div>
  );
}
